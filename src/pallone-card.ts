/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  TemplateResult,
  css,
  PropertyValues,
  CSSResultGroup,
} from 'lit';
import { customElement, property, state } from "lit/decorators";
import {
  formatDate,
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers


import './editor';

import type { PalloneCardCuloConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  PALLONE-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'pallone-card',
  name: 'Pallone Card',
  description: 'A custom card to show your favourite club next Match. Best choice of club would be Napoli of course.',
});

interface matchAttribute {
  home_team_name?: string;
  home_team_logo?: string;
  away_team_logo?: string;
  away_team_name?: string;
  match_day?: string;
  venue?: string;
  venue_location?: string;
  referee?: string;
  league?: string;
  league_logo?: string;
  league_round?: string;
  today_match?: boolean;
  last_update?: Date;
}
// TODO Name your custom element
@customElement('pallone-card')
export class PalloneCardCulo extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('pallone-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: PalloneCardCuloConfig;

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(config: PalloneCardCuloConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Boilerplate',
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }
    const stateObj = this.config.entity ? this.hass.states[this.config.entity].attributes as matchAttribute : {};
    const { home_team_name,home_team_logo,away_team_logo,away_team_name,match_day,venue,venue_location,referee,league,league_logo,league_round,today_match,last_update } =  stateObj;
    const title = today_match ? 'Today Match' : 'Next Match'
    const dateMatchDate = match_day && new Date(match_day) || new Date();
    return html`
      <ha-card .header=${title} id="pallone-card">
        <div id="league"><img class="league_logo" src="${league_logo}"></div>
        <div id="league_round">${league_round}</div>
        <div id="teams">
          <div class="team"><img src="${home_team_logo}"></div>
          <div class="team"><img src="${away_team_logo}"></div>
        </div>
        <div id="time">${formatDate(dateMatchDate, this.hass.locale)}</div>
        <div id="referee">${referee}</div>
        <div id="venue">${venue}, ${venue_location}</div>
      </ha-card>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return css`
    #pallone-card{
      text-align: center;
    }
    #teams{
      margin: 15px 0;
    }
    .team{
      display: inline-block;
    }
    .team img{
      width: 70px;
    }
    .league_logo{
      width: 25px;
    }`;
  }
}
