// The minimum prediction confidence.
const threshold = 0.9;

//shortener for element by id
function $(x) {
  return document.getElementById(x);
}

//busy. If busy, not able to send in a new insult
let busy  = false
//counter. Invisible variable to sort by recent if score is the same.
let count = 0

// initialize the sentence list
// total, phrase, identity attack, insult, obscene, severe, sexually explicit, threat, brevity, count
let list = [
    [29,'You smell bad.', 0, 32, 0, 0, 0, 0, 84,92]];

//sort the sentences by score, trim the list if too long, and show in a table
let j

function arrangelist() {
  list = list.sort(function(a, b) {
    if (a[0] == b[0]) {
      return b[9] - a[9];
    }
    return b[0] - a[0];
  });

  if (list.length > 10)
  {list.splice(10,1)}

  for (i = 0; i < list.length; i++) {
    for (k = 0; k < 8; k++) {document.getElementsByTagName('td')[i * 9 + k].innerText = list[i][k];}
    document.getElementsByTagName('td')[i * 9 + 8].innerText = list[i][8] + '%';
  }
}
arrangelist();

//press enter to add to list

$('input').onkeypress = () => {
    var x = event.key;
    if (x == 'Enter' && busy == false) {
      busy = true;
      list.push([0,$('input').value, 0, 0, 0, 0, 0, 0, 0,count]);
      count +=1 ;
      $('input').value = null;

      if (list.length < 10)
      {document.getElementsByTagName('td')[list.length * 9 + 1].innerText = 'Loading...' }

      //get toxicity
      toxicity.load(threshold).then(model => {
          const input = list[list.length - 1];

          model.classify(input[1]).then(predictions => {
              // `predictions` is an array of objects, one for each prediction head,

              //the scores are weighed to encourage insults and not just dirty words

              input[2] = Math.floor(150*predictions[0].results[0].probabilities[1]);
              input[3] = Math.floor(200*predictions[1].results[0].probabilities[1]);
              input[4] = Math.floor(100*predictions[2].results[0].probabilities[1]);
              input[5] = Math.floor(4000*predictions[3].results[0].probabilities[1]);
              input[6] = Math.floor(100*predictions[4].results[0].probabilities[1]);
              input[7] = Math.floor(200*predictions[5].results[0].probabilities[1]);
              /*
              for (i=0; i < 6; i++) {
                input[i+2] = Math.floor(100*predictions[i].results[0].probabilities[1]);
              }
              */
              input[8] = Math.min(100,Math.ceil(103 - 3 * Math.sqrt(input[1].length)));
              input[0] = Math.round((input[2] + input[3]+ input[4]+ input[5] + input[6] + input[7]) * input[8] / 100)

                arrangelist();

              busy = false;

              if (list.length < 10)
                {document.getElementsByTagName('td')[list.length * 9 + 1].innerText = ''}
            })
          })
        }
      }