# ha-pallone-sensor

this is a card to display https://github.com/sunsgs/ha-pallone-sensor

### installation

move the content of the dist folder into www folder of your configuration for ha, go to configuration->dashboards->resources and add : 
url: local/pallone-card.js?v=1.0.0
resource-type:  Javascript Module

Then go to your view add the card to lovelace (custom:pallone card ) or in visual mode or in yaml mode :

```yaml
type: custom:pallone-card
entity: sensor.pallone
```

### example of card

![alt text](https://github.com/sunsgs/ha-pallone-card/blob/main/imgs/ha-pallone-card.png?raw=true)
