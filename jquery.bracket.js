function createTeamElement(round, name, score) {
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

/* refactor with loser bracket */
function getTeamNames(results, round, match)
{
  var getTeamName = function(results, round, match, n) {
      var score = results[0][round-1][match*2+n];
      var mod = ':first';

      if (score[0] < score[1])
        mod = ':last';

      return $('#match-'+(round-1)+'-'+(match*2+n)+' .team'+mod+' b').text();
    }

  return [getTeamName(results, round, match, 0), getTeamName(results, round, match, 1)];
}

function render(data)
{
  renderWinners(data);
  renderLosers(data);
}

function renderWinners(data)
{
  var teams = data['teams'];
  var results = data['results'];
  var rounds = Math.log(teams.length*2) / Math.log(2);
  var matches = teams.length;
  var graphHeight = $('#bracket').height();

  for (var r = 0; r < rounds; r++) {
    var roundId = 'round-'+r;
    roundEl = $('<div class="round" id="'+roundId+'"></div>').appendTo('#bracket');

    for (var m = 0; m < matches; m++) {
      var matchId = "match-"+r+"-"+m;
      el = $('<div class="match" id="'+matchId+'"></div>').appendTo('#'+roundId);
      var score = results[0][r][m];
      var teamBlocks = '<div class="teamContainer">'+
                       '</div>';

      var team;
      if (r == 0)
        team = teams[m];
      else
        team = getTeamNames(results, r, m);
    
      teamBlocks = $(teamBlocks).append(createTeamElement(r, team[0], score));
      teamBlocks = $(teamBlocks).append(createTeamElement(r, team[1], [score[1],score[0]]));

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

/* refactor with loser bracket */
function getWinnerTeamNames(results, round, match, n)
{
  var getTeamName = function(results, round, match, n) {
      var score = results[1][round][match];
      var mod = ':first';

      if (score[0] < score[1])
        mod = ':last';

      var str = '#loserBracket #match-'+(round)+'-'+(match)+'-1 .team'+mod+' b'
      console.log(str);
      var winner = $(str);
      console.log(winner);
      return winner.text();
    }

  return [getTeamName(results, round-1, match*2, n), 
          getTeamName(results, round-1, match*2+1, n)];
}

function renderLosers(data)
{
  var teams = data['teams'];
  var results = data['results'];
  var rounds = Math.log(teams.length*2) / Math.log(2)-1;
  var matches = teams.length/2;
  var graphHeight = $('#loserBracket').height();

  for (var r = 0; r < rounds; r++) {
    for (var n = 0; n < 2; n++) {
      var roundId = 'lround-'+r+'-'+n;
      console.log(n);
      roundEl = $('<div class="round" id="'+roundId+'"></div>').appendTo('#loserBracket');

      for (var m = 0; m < matches; m++) {
        var matchId = "match-"+r+"-"+m+"-"+n;
        var score = results[1][r][m];
        el = $('<div class="match" id="'+matchId+'"></div>').appendTo('#'+roundId);

        var teamBlocks = '<div class="teamContainer">'+
          '</div>';
        var team;
        /* match inside losers bracket */
        if (n%2 == 0) {
          /* first round comes from winner bracket */
          console.log(n);
          if (r == 0) {
            var getLoser = function(results, r, m) {
              var team;
              if (results[0][r][m][0] < results[0][r][m][1])
                team = teams[m][0];
              else
                team = teams[m][1];
              return team;
            };
            team = [getLoser(results, 0, m*2), getLoser(results, 0, m*2+1)];
          }
          else {
            var getLoser = function(results, r, m) {
              var team;
              if (results[1][r][m][0] > results[1][r][m][1])
                team = teams[m][0];
              else
                team = teams[m][1];
              return team;
            };
            //team = [getLoser(results, r, m*2), getLoser(results, r, m*2+1)];
            team = getWinnerTeamNames(results, r, m, n);
          }
        }
        else { /* match with dropped */
          var getWinner = function(results, r, m) {
            var getTeamName = function(results, round, match) {
              var score = results[1][round][match];
              var mod = ':first';

              if (score[0] < score[1])
                mod = ':last';

              return $('#loserBracket #match-'+(round)+'-'+(match)+'-0 .team'+mod+' b').text();
            }

            return getTeamName(results, r, m);
          };
          var getLoser = function(results, r, m) {
            var score = results[0][r][m];
            var mod = ':first';

            if (score[0] > score[1])
              mod = ':last';
            var loser = $('#bracket #match-'+(r)+'-'+(m)+' .team'+mod+' b');
            return loser.text();
          };
          team = [getWinner(results, r, m), getLoser(results, r+1, m)];
        }
      
        teamBlocks = $(teamBlocks).append(createTeamElement(r, team[0], score));
        /* no toConnector every second time as this comes from winners */
        if (n%2 == 1)
          teamBlocks = $(teamBlocks).append(createTeamElement(0, team[1], [score[1],score[0]]));
        else
          teamBlocks = $(teamBlocks).append(createTeamElement(r, team[1], [score[1],score[0]]));

        el.css('height', (graphHeight/matches)+'px');
        elC = $(teamBlocks).appendTo(el);
        elC.css('top', (el.height()/2-elC.height()/2)+'px');
      }
    }
    matches /= 2;
  }
}
