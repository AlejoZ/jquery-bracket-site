function roundGap() {
  return parseInt($('.round:first').css('margin-right'))/2
}
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

  return tEl;
}

function connector(height, shift, teamContainer) {
  var width = roundGap()
  var drop = true;
  // drop:
  //  �\
  //    \_
  // !drop:
  //    /�
  //  _/
  if (height < 0) {
    drop = false;
    height = -height;
  }
  var src = $('<div class="connector"></div>').appendTo(teamContainer);
  src.css('height', height);
  src.css('width', width+'px');
  src.css('right', (-width-2)+'px');

  if (shift >= 0)
    src.css('top', shift+'px');
  else
    src.css('bottom', (-shift)+'px');
  
  if (drop)
    src.css('border-bottom', 'none');
  else
    src.css('border-top', 'none');

  var dst = $('<div class="connector"></div>').appendTo(src);
  dst.css('width', width+'px');
  dst.css('right', -width+'px');
  if (drop)
    dst.css('bottom', '0px');
  else
    dst.css('top', '0px');

  return src;
}

// used for mapping
function toText() { return $(this).text() }

var Match = function(round, data, id, results) {
  var container = $('<div class="match"></div>').appendTo(round.el);
  var teamContainer = $('<div class="teamContainer"></div>')
  teamContainer.append(createTeamElement(round.id, data[0].name, [results[0], results[1]]))
  teamContainer.append(createTeamElement(round.id, data[1].name, [results[1], results[0]]))

  container.append(teamContainer)

  data[0].id = 0
  data[1].id = 1
  data[0].score = results[0]
  data[1].score = results[1]

  return {
    el: container,
    id: id,
    winner: function() {
      if (data[0].score > data[1].score)
        return data[0]
      else
        return data[1]
    },
    loser: function() {
      if (data[0].score > data[1].score)
        return data[1]
      else
        return data[0]
    },
    results: data
  }
}

var Round = function(bracket, roundId, results) {
  var matches = []
  var container = $('<div class="round"></div>').appendTo(bracket.el)

  return {
    el: container,
    id: roundId,
    addMatch: function(teams, teamCb) {
        var id = matches.length

        if (teamCb != null)
          var teams = teamCb()
        else
          var teams = [{name: bracket.round(roundId-1).match(id*2).winner().name},
                       {name: bracket.round(roundId-1).match(id*2+1).winner().name}]

        var match = new Match(this, teams, id, results[id])
        matches.push(match)
        return match;
    },
    match: function(id) {
      return matches[id]
    }
  }
}

var Bracket = function(container, results, teams)
{
  var rounds = []
  return {
    el: container,
    addRound: function() {
      var id = rounds.length
      var round = new Round(this, id, results[id])
      rounds.push(round)
      return round;
    },
    round: function(id) {
      return rounds[id]
    },
    getWinnerTeam: function() {
      var match = container.find('.match:last')
      var names = match.find('b').map(toText)
      var scores = match.find('span').map(toText)
      var winner = {name:null,score:0}

      if (scores[0] > scores[1]) {
        winner.score = scores[0]
        winner.name = names[0]
      }
      else {
        winner.score = scores[1]
        winner.name = names[1]
      }
      return winner
    }
  }
}

function render(data)
{
  var winners = $('#bracket')
  var losers = $('#loserBracket')
  var w = new Bracket(winners, data.results[0], data.teams)
  var l = new Bracket(losers, data.results[1], null)
  renderWinners(w, losers, data);
  renderLosers(w, l, data);
  renderFinals(w, l, data);

  postProcess($('#system'), data);
}

function postProcess(container, data)
{
  var Track = function(teamIndex, class) {
      var index = teamIndex;
      var elements = $('.team[index='+index+']')
      if (!class)
        var addedClass = 'highlight'
      else
        var addedClass = class

      return {
          highlight: function() {
              elements.each(function() {
                  $(this).addClass(addedClass)

                  if ($(this).hasClass('win'))
                    $(this).parent().find('.connector').addClass(addedClass)
                })
        },

        deHighlight: function() {
            elements.each(function() {
              $(this).removeClass(addedClass)
              $(this).parent().find('.connector').removeClass(addedClass)
            })
        }
      }
    }
  var m = {};

  for (var i = 0; i < data.teams.length; i++)
  {
    m[data.teams[i][0]] = i*2
    m[data.teams[i][1]] = i*2+1
  }

  container.find('div.team b').each(
      function() {
        var key = $(this).text()
        //$(this).parent().addClass('team-'+m[key]); 
        $(this).parent().attr('index', m[key]); 
      } 
    );

  var winTrack = new Track(6, 'highlightWinner');
  var loseTrack = new Track(15, 'highlightLoser');
  winTrack.highlight()
  loseTrack.highlight()

  $('.team').mouseover(function() {
      var i = $(this).attr('index') 
      winTrack.deHighlight()
      loseTrack.deHighlight()
      track = new Track(i);
      track.highlight()
      $(this).mouseout(function() {
          track.deHighlight()
          winTrack.highlight()
          loseTrack.highlight()
          $(this).unbind('mouseout')
        })
    })
}

function renderWinners(winners, losers, data)
{
  var teams = data.teams;
  var results = data.results;
  var rounds = Math.log(teams.length*2) / Math.log(2);
  var matches = teams.length;
  var graphHeight = winners.el.height();

  for (var r = 0; r < rounds; r++) {
    var round = winners.addRound(data.results[r])

    for (var m = 0; m < matches; m++) {
      var team;

      var teamCb = null
      if (r == 0) {
        teamCb = function() {
            var t = teams[m]
            return [{name: t[0]}, {name: t[1]}]
          }
      }
    
      var match = round.addMatch(null, teamCb)

      /* todo: move to class */
      var elClassTeamContainer = match.el.find('.teamContainer')
      match.el.css('height', (graphHeight/matches)+'px');
      elClassTeamContainer.css('top', (match.el.height()/2-elClassTeamContainer.height()/2)+'px');

      if (r < (rounds-1)) {
        var height, shift

        var connectorOffset = elClassTeamContainer.height()/4
        var matchupOffset = match.el.height()/2

        if (m%2 == 0) { // dir == down
          if (match.winner().id == 0) {
            height = matchupOffset
            shift = connectorOffset
          }
          else {
            height = matchupOffset - connectorOffset*2
            shift = connectorOffset*3
          }
        }
        else { // dir == up
          if (match.winner().id == 0) {
            height = -matchupOffset + connectorOffset*2
            shift = -connectorOffset*3
          }
          else {
            height = -matchupOffset
            shift = -connectorOffset
          }
        }

        elClassTeamContainer.append(connector(height, shift, elClassTeamContainer));
      }
    }
    matches /= 2;
  }
}

function renderLosers(winners, losers, data)
{
  var teams = data.teams;
  var results = data.results;
  var rounds = Math.log(teams.length*2) / Math.log(2)-1;
  var matches = teams.length/2;
  var graphHeight = losers.el.height();

  for (var r = 0; r < rounds; r++) {
    for (var n = 0; n < 2; n++) {
      var round = losers.addRound()

      for (var m = 0; m < matches; m++) {
        var score = results[1][r*2+n][m];
        
        var teamCb = null
        /* special cases */
        if (!(n%2 == 0 && r != 0)) teamCb = function() {
          /* first round comes from winner bracket */
          if (n%2 == 0 && r == 0) {
            return [{name: winners.round(0).match(m*2).loser().name}, 
                    {name: winners.round(0).match(m*2+1).loser().name}]
          }
          else { /* match with dropped */
            return [{name: losers.round(r*2).match(m).winner().name},
                    {name: winners.round(r+1).match(m).loser().name}]
          }
        }
      
        var match = round.addMatch(null, teamCb)
        match.el.css('height', (graphHeight/matches)+'px');
        var teamContainer = match.el.find('.teamContainer')
        teamContainer.appendTo(match.el);
        teamContainer.css('top', (match.el.height()/2-teamContainer.height()/2)+'px');

        var connectorOffset = teamContainer.height()/4
        var matchupOffset = match.el.height()/2

        if (r < rounds-1 || n < 1) {
          var height = 0;
          var shift = 0;

          // inside lower bracket 
          if (n%2 == 0) {
            if (score[0] > score[1])
              height = 0;
            else
              height = -connectorOffset*2;

            shift = connectorOffset
          }
          else { // from winner bracket 
            if (m%2 == 0) { // dir == down 
              if (score[0] > score[1]) {
                shift = connectorOffset
                height = matchupOffset
              }
              else {
                shift = connectorOffset*3
                height = matchupOffset - connectorOffset*2
              }
            }
            else { // dir == up
              if (score[0] > score[1]) {
                shift = -connectorOffset*3
                height = -matchupOffset + connectorOffset*2
              }
              else {
                shift = -connectorOffset
                height = -matchupOffset
              }
            }
          }
          teamContainer.append(connector(height, shift, teamContainer));
        }
      }
    }
    matches /= 2;
  }
}

function renderFinals(winners, losers, data)
{
  var elClassRound = $('<div class="round"></div>').appendTo('#finals')
  var elClassMatch = $('<div class="match"></div>').appendTo(elClassRound)
  var elClassTeamContainer = $('<div class="teamContainer"></div>');
  var height = winners.el.height()+losers.el.height()
  var finalScore = data.results[2][0]

  var winnerScore = function(array) {
    return array[array.length-1][0]
  }

  var finalists = [winners.getWinnerTeam(), losers.getWinnerTeam()]

  elClassMatch.css('height', (height)+'px');
  elClassTeamContainer.append(createTeamElement(3, finalists[0].name, finalScore));
  elClassTeamContainer.append(createTeamElement(3, finalists[1].name, [finalScore[1],finalScore[0]]));
  elClassTeamContainer.appendTo(elClassMatch);

  var shift = (winners.el.height()/2 + winners.el.height()+losers.el.height()/2)/2 - elClassTeamContainer.height()/2 
  elClassTeamContainer.css('top', (shift)+'px');

  var height = shift-winners.el.height()/2
  var shift = elClassTeamContainer.height()/4 

  var score = winnerScore(data.results[0])
  if (score[0] > score[1]) {
    height = height+shift*2
  }
  connector(height,  shift,  elClassTeamContainer).appendTo(winners.el.find('.teamContainer:last'))

  var score = winnerScore(data.results[1])
  if (score[0] > score[1]) {
    height = height-shift*2
  }
  connector(-height, -shift, elClassTeamContainer).appendTo(losers.el.find('.teamContainer:last'))
}
