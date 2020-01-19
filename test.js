var arc_wifi_key = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streams/F1AbEbgZy4oKQ9kiBiZJTW7eugw1d09nFPu5hGUtUhRt5d2AA4adEPLuHRFMQvB3Pt0VKPgVVRJTC1BRlxBQ0VcVUMgREFWSVNcSUNTIEJVSUxESU5HU1xBUkN8V0lGSSBPQ0NVUEFOVFM/value';
var arc_sq_ft_key = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streams/F1AbEbgZy4oKQ9kiBiZJTW7eugwr1rAt6dQ5BG4fRgDcyrprwmFWwiEf1tVQseNk58UYmagVVRJTC1BRlxDRUZTXFVDREFWSVNcQlVJTERJTkdTXEFDVElWSVRJRVMgQU5EIFJFQ1JFQVRJT04gQ0VOVEVSXFNURUFNfFRPVEFMIE1BSU5UQUlORUQgR1JPU1MgU1EuIEZULg/value';
fetch(arc_wifi_key)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    document.getElementById('output').innerHTML = myJson['Value'];
  });

fetch(arc_sq_ft_key)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    document.getElementById('sqft').innerHTML = myJson['Value'];
  });
let electricity_data = '';

var buildings = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/F1EmbgZy4oKQ9kiBiZJTW7eugwvgV_Y00J5BGt6DwVwsURwwVVRJTC1BRlxDRUZTXFVDREFWSVNcQlVJTERJTkdT/elements';
fetch(buildings)
  .then((response) => {
    return response.json();
  })
  .then((items) => {
    var numbuildings = items['Items'].length;
    document.getElementById('numbuildings').innerHTML = numbuildings;
    for (i = 0; i < numbuildings; i++) {
      var attributelink = items['Items'][i]['Links']['Elements'];
      fetch(attributelink)
        .then((response) => {
          return response.json();
        })
        .then((items) => {
          // console.log(items);
          let attributename = '';
          let name = '';
          let value = '';
          let units = '';
          var promises = [];
          for (j = 0; j < items['Items'].length; j++) {
            let attribute = items['Items'][j]['Links']['Value'];
            // attributename is one of Chilled Water, Domestic Water, Electricity, Gas, or Steam
            attributename = items['Items'][j]['Name'];
            // console.log(attributename);
            // we only care about each building's energy usage
            if (attributename !== 'Electricity') {
              continue;
            }
            // attribute is each attribute inside the Electricity object for each building
            var promise = fetch(attribute)
              .then((response) => {
                return response.json();
              })
              .then((items) => {
                for (k = 0; k < items['Items'].length; k++) {
                  name = items['Items'][k]['Name'];
                  if (items['Items'][k]['Value']['Value'] != null) {
                    value = items['Items'][k]['Value']['Value'];
                  } else {
                    value = 'not set';
                  }
                  units = items['Items'][k]['Value']['UnitsAbbreviation'];
                  // console.log(name + ': ' + value + ' ' + units);
                  electricity_data += name + ': ' + value.toString() + ' ' + units + '<br>';
                }
              });
            promises.push(promise);
          }
          Promise.all(promises).then(() => {
            document.getElementById('electricity_data').innerHTML = electricity_data;
          });
        })
    }
  })
  
  var wifi_buildings = "https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/F1EmbgZy4oKQ9kiBiZJTW7eugwMLOlxFHu5hGUtUhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcSUNTIEJVSUxESU5HUw/elements";
  fetch(wifi_buildings)
    .then((response) => {
      return response.json();
    })
    .then((items) => {
      for (i = 0; i < items['Items'].length; i++) {
        fetch(items['Items'][i]['Links']['Attributes']) 
          .then((response) => {
            return response.json();
          })
          .then((items) => {
            let object = '';
            for (j = 0; j < items['Items'].length; j++) {
              object = items['Items'][j];
              if (object['Name'] === 'WIFI Occupants') {
                fetch(object['Links']['Value']) 
                  .then((response) => {
                    return response.json();
                  })
                  .then((wifi_object) => {
                    console.log('Number of WiFi devices connected: ' + wifi_object['Value']);
                  })
                break;
              } else {
                continue;
              }
            }
            // console.log(items['Items']);
          })
      }
    });
  // .then(() => {
  // });