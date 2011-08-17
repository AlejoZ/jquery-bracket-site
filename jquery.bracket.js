function getTeam(round, name, score) {
  var tEl = $('<div class="team"><b>'+name+'</b><span>'+score[0]+'</span></div>');

  if (score) {
    if (score[0] > score[1])
      tEl.addClass('win')
    else if (score[0] < score[1])
      tEl.addClass('lose')
    else
      tEl.addClass('tie')
  }

  if (round == 0)
    return tEl;

  var elCon = $('<div class="connectorTo"></div>').appendTo(tEl);
  elCon.css('width', '20px');
  elCon.css('left', '-20px');
  elCon.css('top', '-10px');

  return tEl;
}
function render(data)
{
  var teams = data['teams'];
  var results = data['results'];
  var rounds = Math.log(teams.length*2) / Math.log(2);
  var matches = teams.length;
  var graphHeight = $('#bracket').height();

  for (var r = 0; r < rounds; r++) {
    var roundId = 'round-'+r;
    roundEl = $('<div class="round" id="'+roundId+'"></div>').appendTo('#bracket');
    console.log(matches);
    for (var m = 0; m < matches; m++) {
      var matchId = "match-"+r+"-"+m;
      el = $('<div class="match" id="'+matchId+'"></div>').appendTo('#'+roundId);
      var score = results[r][m]
      var teamBlocks = '<div class="teamContainer">'+
                       '</div>';

      var team;
      if (r == 0) {
        team = teams[m];
      }
      else {
        var s = results[r-1][m*2];
        var mod = ':first';

        if (s[0] < s[1])
          mod = ':last';

        team[0] = $('#match-'+(r-1)+'-'+(m*2)+' .team'+mod+' b').text();

        s = results[r-1][m*2+1];
        mod = ':first';

        if (s[0] < s[1])
          mod = ':last';
        team[1] = $('#match-'+(r-1)+'-'+(m*2+1)+' .team'+mod+' b').text();
      }
    
      teamBlocks = $(teamBlocks).append(getTeam(r, team[0], score));
      teamBlocks = $(teamBlocks).append(getTeam(r, team[1], [score[1],score[0]]));

      el.css('height', (graphHeight/matches)+'px');
      elC = $(teamBlocks).appendTo(el);
      elC.css('top', (el.height()/2-elC.height()/2)+'px');

      if (r < (rounds-1)) {
        var height = el.height()/2;
        var tShift = elC.height()/2 - 13;
        var shift;
        var shiftDir;

        elCon = $('<div class="connectorFrom"></div>').appendTo(elC);

        if (m%2 == 0) { /* dir == down */
          elCon.css('border-bottom', 'none');
          //elCon.css('border-color', 'red');
          if (score[0] > score[1]) {
            height = el.height()/2;
            shift = elC.height()/4;
          }
          else {
            height = el.height()/2 - elC.height()/2;
            shift = elC.height()/2 + tShift;
          }
        }
        else { /* dir == up */
          elCon.css('border-top', 'none');
          //elCon.css('border-color', 'green');
          if (score[0] > score[1]) {
            height = el.height()/2 - elC.height()/2;
            shift = -elC.height()/2 - tShift;
          }
          else {
            height = el.height()/2-1;
            shift = -elC.height()/4;
          }
        }

        elCon.css('height', height);
        elCon.css('width', '20px');
        elCon.css('left', elC.width());
        if (shift >= 0)
          elCon.css('top', shift+'px');
        else
          elCon.css('bottom', (-shift)+'px');
      }
    }
    matches /= 2;
  }
}
