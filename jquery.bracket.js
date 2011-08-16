function getTeam(name, score) {
  var tEl = $('<div class="team"><b>'+name+'</b><span>'+score[0]+'</span></div>');
  if (score) {
    if (score[0] > score[1])
      tEl.addClass('win')
    else if (score[0] < score[1])
      tEl.addClass('lose')
    else
      tEl.addClass('tie')
  }
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
    
      teamBlocks = $(teamBlocks).append(getTeam(team[0], score));
      teamBlocks = $(teamBlocks).append(getTeam(team[1], [score[1],score[0]]));

      el.css('height', (graphHeight/matches)+'px');
      elC = $(teamBlocks).appendTo(el);
      elC.css('top', (el.height()/2-elC.height()/2)+'px');

      if (r < (rounds-1) && m % 2 == 0) {
        elCon = $('<div class="connectorFrom"></div>').appendTo(elC);
        elCon.css('height', el.height());
        elCon.css('width', '20px');
        elCon.css('top', '20px');
        elCon.css('left', elC.width());
      }

      if (r > 0) {
        elCon = $('<div class="connectorTo"></div>').appendTo(elC);
        elCon.css('width', '20px');
        elCon.css('left', '-20px');
        elCon.css('top', '20px');
      }
    }
    matches /= 2;
  }
}
