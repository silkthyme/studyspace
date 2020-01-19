let model = {};
var number_of_devices_key = 'number_of_connected_devices';

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
const electricity_promise = fetch(buildings)
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
          let attributename = '';
          let name = '';
          let value = '';
          let units = '';
          let promises = [];
          for (j = 0; j < items['Items'].length; j++) {
            let attribute = items['Items'][j]['Links']['Value'];
            // attributename is one of Chilled Water, Domestic Water, Electricity, Gas, or Steam
            attributename = items['Items'][j]['Name'];
            // we only care about each building's energy usage
            if (attributename !== 'Electricity') {
              continue;
            }
            // attribute is each attribute inside the Electricity object for each building
            const promise = fetch(attribute)
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

let promise_count = 0;
let wifi_data = '';
var wifi_buildings = "https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/F1EmbgZy4oKQ9kiBiZJTW7eugwMLOlxFHu5hGUtUhRt5d2AAVVRJTC1BRlxBQ0VcVUMgREFWSVNcSUNTIEJVSUxESU5HUw/elements";
const wifi_promise = fetch(wifi_buildings)
  .then((response) => {
    return response.json();
  })
  .then((items) => {
    let buildingPromises = [];
    for (i = 0; i < items['Items'].length; i++) {
      console.log('Building: ' + items['Items'][i]['Name']);

      const nameOfBuilding = items['Items'][i]['Name'];
      let buildingObject = model[nameOfBuilding] || {
        name: items['Items'][i]['Name'],
      }

      model[nameOfBuilding] = buildingObject;
      // model[buildingObject.name][number_of_devices_key] = "delete me later1";
      const buildingPromise = fetch(items['Items'][i]['Links']['Attributes'])
        .then((response) => {
          // model[buildingObject.name][number_of_devices_key] = "delete me later2";
          return response.json();
        })
        .then((items) => {
          let object = '';
          let promises = [];
          for (j = 0; j < items['Items'].length; j++) {
            object = items['Items'][j];
            if (object['Name'] === 'WIFI Occupants') {
              const promise = fetch(object['Links']['Value'])
                .then((response) => {
                  // model[buildingObject.name][number_of_devices_key] = 'before the first return';
                  return response.json();
                })
                .then((wifi_object) => {
                  promise_count++;
                  console.log(`Promises resolved = ${promise_count}`);
                  console.log('index: ' + j + ' -> ' + wifi_object['Value']);
                  wifi_data += 'index: ' + promise_count + '. Number of devices connected in this building: ' + wifi_object['Value'] + '<br>';
                  model[buildingObject.name][number_of_devices_key] = wifi_object['Value'];
                  // const number_of_devices = wifi_object['Value'];
                  // buildingObject[number_of_devices_key] = number_of_devices;
                  // model[buildingObject.name] = buildingObject;
                  // console.log('>>>>>>' + model[buildingObject.name][number_of_devices_key]);
                });
              promises.push(promise);
              break;
            } else {
              continue;
            }
          }
          Promise.all(promises).then(() => {
            document.getElementById('wifi_data').innerHTML = wifi_data;
            // render();
          });
        });
      buildingPromises.push(buildingPromise);
    
    }
    Promise.all(buildingPromises).then(() => {
      render();
    });
    // console.log(`Promises length = ${promises.length}`);
  });
// .then(() => {
// });


function render() {
  const ul_list = document.getElementById('buildings-list');
  for (building in model) {
    // console.log(building);
    console.log('>>>>>>' + [building][number_of_devices_key]);
    ul_list.append(newBuildingLi(model[building]));
  }
}

function newBuildingLi(building) {
  const li_item = document.createElement('li');
  const header = document.createElement('h3');
  header.innerText = building['name'];
  const paragraph = document.createElement('p');
  paragraph.innerText = `There are ${building[number_of_devices_key]} devices connected to the Wifi in ${building.name}`;
  li_item.append(header);
  li_item.append(paragraph);
  return li_item;
}

  // Promise.all([electricity_promise, wifi_promise]).then(render);