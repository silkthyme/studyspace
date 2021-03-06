let model = {};
var number_of_devices_key = 'number_of_connected_devices';
var max_number_of_devices_key = 'max_number_of_devices_key';
var ratio_key = 'ratio_key';

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
            // We want to add the Demand to the model map.
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
    let wifiOccupantPromises = [];
    let interpolatedPromises = [];
    for (i = 0; i < items['Items'].length; i++) {
      console.log('Building: ' + items['Items'][i]['Name']);

      const nameOfBuilding = items['Items'][i]['Name'];
      let buildingObject = model[nameOfBuilding] || {
        name: items['Items'][i]['Name'],
      }

      model[nameOfBuilding] = buildingObject;
      const buildingPromise = fetch(items['Items'][i]['Links']['Attributes'])
        .then((response) => {
          return response.json();
        })
        .then((items) => {
          let object = '';
          for (j = 0; j < items['Items'].length; j++) {
            object = items['Items'][j];
            if (object['Name'] === 'WIFI Occupants') {
              const wifiOccupantPromise = fetch(object['Links']['Value'])
                .then((response) => {
                  return response.json();
                })
                .then((wifi_object) => {
                  promise_count++;
                  console.log(`Promises resolved = ${promise_count}`);
                  console.log('wifi object: ' + j + '. ' + wifi_object['Value']);
                  wifi_data += 'index: ' + promise_count + '. Number of devices connected in this building: ' + wifi_object['Value'] + '<br>';
                  model[buildingObject.name][number_of_devices_key] = wifi_object['Value'];
                });
              wifiOccupantPromises.push(wifiOccupantPromise);

              // getting the interpolated data so that we can get the max number of wifi occupants in past
              /*
              Time interval: The past week, time intervals of 1 hour.
              https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streams/F1AbEbgZy4oKQ9kiBiZJTW7eugwSTpv31Hu5hGUtUhRt5d2AAfUAWf7mHRFMQvB3Pt0VKPgVVRJTC1BRlxBQ0VcVUMgREFWSVNcSUNTIEJVSUxESU5HU1xBQ0FEfFdJRkkgT0NDVVBBTlRT/interpolated?starttime=2019&endtime=2020&interval=100h
              */
              const interpolatedPromise = fetch(object['Links']['InterpolatedData'] + '?starttime=-1w&endtime=Today&interval=1h')
                .then((response) => {
                  return response.json();
                })
                .then((interpolated_object) => {
                  // Later, change the interpolated_object to iterate through all the objects in the Items and array and take the maximum
                  if (interpolated_object['Items'] !== undefined) {
                    console.log('interpolated data: ' + j + '. ' + interpolated_object['Items'][0]['Value']);
                    const interpolated_array = interpolated_object['Items'].map((item) => {
                      return item['Value'];
                    });
                    const maxValue = Math.max(...interpolated_array);
                    
                    model[buildingObject.name][max_number_of_devices_key] = maxValue;
                    model[buildingObject.name][ratio_key] = buildingObject[number_of_devices_key] / maxValue;

                    console.log('max of ' + nameOfBuilding + ' is ' + maxValue);
                    console.log('___________________________________');
                  }
                });
              interpolatedPromises.push(interpolatedPromise);
              break;
            } else {
              continue;
            }
          }
        });
      buildingPromises.push(buildingPromise);
    }
    Promise.all(buildingPromises).then(() => {
      Promise.all(wifiOccupantPromises).then(() => {
        Promise.all(interpolatedPromises).then(() => {
          let modelArray = Object.values(model);

          modelArray = modelArray.sort(compareBuildings);
          console.log(modelArray);
          render();
        })
      })
    });
  });

function render() {
  const ul_list = document.getElementById('buildings-list');
  for (const building in model) {
    ul_list.append(newBuildingLi(model[building]));
  }
  console.log(model);
}

function newBuildingLi(building) {
  // const li_item = document.createElement('li');
  const header = document.createElement('h3');
  header.innerText = building['name'];

  const sub_ul = document.createElement('ul');

  const li_wifi_devices = document.createElement('li');
  const li_max_num = document.createElement('li');
  const li_ratio = document.createElement('li');
  
  li_wifi_devices.innerText = `There are ${building[number_of_devices_key]} devices connected to the Wifi in ${building.name}`;
  li_max_num.innerText = `Maximum number of WiFi devices connected in the last week: ${building[max_number_of_devices_key]}`;
  li_ratio.innerText = `Ratio of current number of connected devices to maximum in the past week: ${building[ratio_key]}`;

  sub_ul.append(li_wifi_devices);
  sub_ul.append(li_max_num);
  sub_ul.append(li_ratio);
  
  const div_building = document.createElement('div');

  div_building.append(header);
  div_building.append(sub_ul);
  // const paragraph = document.createElement('p');
  // paragraph.innerText = `There are ${building[number_of_devices_key]} devices connected to the Wifi in ${building.name}`;
  // li_item.append(header);
  // li_item.append(paragraph);
  return div_building;
}

function compareBuildings(buildingA, buildingB) {
  const ratioA = buildingA[ratio_key];
  const ratioB = buildingB[ratio_key];
  const maxA = buildingA[max_number_of_devices_key];
  const maxB = buildingB[max_number_of_devices_key];

  if (ratioA < ratioB) {
    return -1;
  } else if (ratioA > ratioB) {
    return 1;
  } else {
    if (maxA < maxB) {
      return 1;
    } else if (maxB < maxA) {
      return -1;
    } else {
      return 0;
    }
  }
}