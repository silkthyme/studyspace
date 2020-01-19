var arc_wifi_key = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streams/F1AbEbgZy4oKQ9kiBiZJTW7eugw1d09nFPu5hGUtUhRt5d2AA4adEPLuHRFMQvB3Pt0VKPgVVRJTC1BRlxBQ0VcVUMgREFWSVNcSUNTIEJVSUxESU5HU1xBUkN8V0lGSSBPQ0NVUEFOVFM/value';
var arc_sq_ft_key = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/streams/F1AbEbgZy4oKQ9kiBiZJTW7eugwr1rAt6dQ5BG4fRgDcyrprwmFWwiEf1tVQseNk58UYmagVVRJTC1BRlxDRUZTXFVDREFWSVNcQlVJTERJTkdTXEFDVElWSVRJRVMgQU5EIFJFQ1JFQVRJT04gQ0VOVEVSXFNURUFNfFRPVEFMIE1BSU5UQUlORUQgR1JPU1MgU1EuIEZULg/value';
fetch(arc_wifi_key)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    console.log(myJson['Value']);
    document.getElementById('output').innerHTML = myJson['Value'];
  });

fetch(arc_sq_ft_key)
.then((response) => {
  return response.json();
})
.then((myJson) => {
  console.log(myJson['Value']);
  document.getElementById('sqft').innerHTML = myJson['Value'];
});

var buildings = 'https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/F1EmbgZy4oKQ9kiBiZJTW7eugwvgV_Y00J5BGt6DwVwsURwwVVRJTC1BRlxDRUZTXFVDREFWSVNcQlVJTERJTkdT/elements';
fetch(buildings)
  .then((response) => {
    return response.json();
  })
  .then((items) => {
    var numbuildings = items['Items'].length;
    document.getElementById('numbuildings').innerHTML = numbuildings;
    // REPLACE 5 WITH NUMBUILDINGS LATER
    for (i = 0; i < numbuildings; i++) {
      //TODO: change the 0 to i later!!!!!
      var attributelink = items['Items'][i]['Links']['Elements'];
      fetch(attributelink)
        .then((response) => {
          return response.json();
        })
        .then((items) => {
          // console.log(items);
          // let chilledwater = items['Items'][0]['Name'];
          // let domesticwater = items['Items'][1]['Name'];
          // console.log(items);
          let name = '';
          let value = '';
          let units = '';
          for (j = 0; j < items['Items'].length; j++) {
            let attribute = items['Items'][j]['Links']['Value'];
            fetch(attribute)
              .then((response) => {
                return response.json();
              })
              .then((items) => {
                // console.log(items);
                name = items['Items'][0]['Name'];
                // console.log(name);
                if (items['Items'][0]['Value']['Value'] != null) {
                  value = items['Items'][0]['Value']['Value'];
                  // console.log('value -> ' + value);
                } else {
                  value = 'undefined';
                }
                // if (items['Items'][0]['Value']['UnitsAbbreviation'] != '') {
                  units = items['Items'][0]['Value']['UnitsAbbreviation'];
                  console.log(name + ': ' + value + ' ' + units);
                // }
              })
          }
          // let electricity = items['Items'][2]['Links']['Value'];
          // // let gas = items['Items'][3]['Name'];
          // // let steam = items['Items'][4]['Name'];
          // fetch(electricity)
          //   .then((response) => {
          //     return response.json();
          //   })
          //   .then((items) => {
          //     // monthly usage electricity
          //     let value = items['Items'][2]['Value']['Value']['Value'];
          //     console.log(value);
          //   })
        })
    }
  });