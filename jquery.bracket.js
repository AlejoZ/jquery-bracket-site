var jqueryBracket = function(opts) 
{
  function assert(statement) {
    if (!statement)
      throw new Error('Assertion error')
  }

  if (!opts)
    throw new Error('Options not set')
  if (!opts.id)
    throw new Error('ID of target container not given')
  if (!opts.init)
    throw new Error('No bracket data given')
  if (opts.userData === undefined)
    opts.userData = null

  var data = opts.init
  var topCon = $('<div class="system"></div>').appendTo('#'+opts.id)

  // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function renderAll(save) {
    w.render()
    if (l && f) {
      l.render()
      f.render()
    }
    postProcess(topCon)

    if (save) {
      data.results[0] = w.results()
      if (l && f) {
        data.results[1] = l.results()
        data.results[2] = f.results()
      }
      if (opts.save)
        opts.save(data, opts.userData)
    }
  }

  var Match = function(round, data, idx, results) 
  {
    function connector(height, shift, teamCon) {
      var width = parseInt($('.round:first').css('margin-right'))/2
      var drop = true;
      // drop:
      // [team]¨\
      //         \_[team]
      // !drop:
      //         /¨[team]
      // [team]_/
      if (height < 0) {
        drop = false;
        height = -height;
      }
      var src = $('<div class="connector"></div>').appendTo(teamCon);
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

    function winner() {
      if (isNumber(data[0].score) && isNumber(data[1].score)) {
        if (data[0].score > data[1].score)
          return data[0]
        else if (data[0].score < data[1].score)
          return data[1]
      }

      return {source: null, name: null, id: -1, score: null}
    }

    function loser() {
      if (isNumber(data[0].score) && isNumber(data[1].score)) {
        if (data[0].score > data[1].score)
          return data[1]
        else if (data[0].score < data[1].score)
          return data[0]
      }

      return {source: null, name: null, id: -1, score: null}
    }

    function teamElement(round, team, isReady) {
      var score = !isNumber(team.score)?'--':team.score
      var sEl = $('<span>'+score+'</span>')
      var name = !team.name?'--':team.name
      var tEl = $('<div class="team"></div>');
      tEl.append('<b>'+name+'</b>')

      if (isNumber(team.idx))
        tEl.attr('index', team.idx)

      if (!team.name)
        tEl.addClass('na')
      else if (winner().name === team.name)
        tEl.addClass('win')
      else if (loser().name === team.name)
        tEl.addClass('lose')

      tEl.append(sEl)

      if (!team.name || !isReady || !opts.save) {
        sEl.attr('disabled', 'disabled')
      }
      else if (opts.save) {
        sEl.click(function() {
            var span = $(this)
            function editor() {
              span.unbind()

              var score
              if (!isNumber(team.score))
                score = ''
              else
                score = span.text()

              var input = $('<input type="text">')
              input.val(score)
              span.html(input)

              input.focus()
              input.keyup(function(e) {
                  if (!isNumber($(this).val()))
                    $(this).addClass('error')
                  else
                    $(this).removeClass('error')

                  if ((e.keyCode || e.which) === 13)
                    $(this).blur()
                })
              input.blur(function() {
                  var val = input.val()
                  if ((!val || !isNumber(val)) && !isNumber(team.score))
                    val = '--'
                  else if ((!val || !isNumber(val)) && isNumber(team.score))
                    val = team.score

                  span.html(val)
                  if (isNumber(val) && score != parseInt(val)) {
                    team.score = parseInt(val)
                    renderAll(true)
                  }
                  span.click(editor)
                })
            }
            editor()
          })
      }
      return tEl;
    }

    var connectorCb = null
    var alignCb = null

    var matchCon = $('<div class="match"></div>')
    var teamCon = $('<div class="teamContainer"></div>')

    data[0].id = 0
    data[1].id = 1

    data[0].name = data[0].source().name
    data[1].name = data[1].source().name

    data[0].score = !results?null:results[0]
    data[1].score = !results?null:results[1]

    /* match has score even though teams haven't yet been decided */
    /* todo: would be nice to have in preload check, maybe too much work */
    if ((!data[0].name || !data[1].name) && (isNumber(data[0].score) || isNumber(data[1].score))) {
      console.log('ERROR IN SCORE DATA: '+data[0].source().name+': '+data[0].score+', '+data[1].source().name+': '+data[1].score)
      data[0].score = data[1].score = null
    }

    return {
      el: matchCon,
      id: idx,
      connectorCb: function(cb) {
        connectorCb = cb 
      },
      connect: function(cb) {
        var connectorOffset = teamCon.height()/4
        var matchupOffset = matchCon.height()/2
        var shift
        var height

        if (!cb || cb === null) {
          if (idx%2 === 0) { // dir == down 
            if (this.winner().id === 0) {
              shift = connectorOffset
              height = matchupOffset
            }
            else if (this.winner().id === 1) {
              shift = connectorOffset*3
              height = matchupOffset - connectorOffset*2
            }
            else {
              shift = connectorOffset*2
              height = matchupOffset - connectorOffset
            }
          }
          else { // dir == up
            if (this.winner().id === 0) {
              shift = -connectorOffset*3
              height = -matchupOffset + connectorOffset*2
            }
            else if (this.winner().id === 1) {
              shift = -connectorOffset
              height = -matchupOffset
            }
            else {
              shift = -connectorOffset*2
              height = -matchupOffset + connectorOffset
            }
          }
        }
        else {
          var info = cb(teamCon, this)
          if (info === null) /* no connector */
            return
          shift = info.shift
          height = info.height
        }
        teamCon.append(connector(height, shift, teamCon));
      },
      winner: winner,
      loser: loser,
      setAlignCb: function(cb) {
        alignCb = cb 
      },
      render: function() {
        matchCon.empty()
        teamCon.empty()

        data[0].name = data[0].source().name
        data[1].name = data[1].source().name
        data[0].idx = data[0].source().idx
        data[1].idx = data[1].source().idx

        var isReady = false
        if (data[0].name && data[1].name)
          isReady = true

        if (!winner().name)
          teamCon.addClass('np')
        else
          teamCon.removeClass('np')

        teamCon.append(teamElement(round.id, data[0], isReady))
        teamCon.append(teamElement(round.id, data[1], isReady))

        matchCon.appendTo(round.el)
        matchCon.append(teamCon)

        this.el.css('height', (round.bracket.el.height()/round.size())+'px');
        teamCon.css('top', (this.el.height()/2-teamCon.height()/2)+'px');

        /* todo: move to class */
        if (alignCb)
          alignCb()

        this.connect(connectorCb)
      },
      results: function() {
        return [data[0].score, data[1].score] 
      }
    }
  }

  var Round = function(bracket, roundIdx, results) 
  {
    var matches = []
    var roundCon = $('<div class="round"></div>')

    return {
      el: roundCon,
      bracket: bracket,
      id: roundIdx,
      addMatch: function(teamCb) {
          var matchIdx = matches.length

          if (teamCb != null)
            var teams = teamCb()
          else
            var teams = [{source: bracket.round(roundIdx-1).match(matchIdx*2).winner},
                        {source: bracket.round(roundIdx-1).match(matchIdx*2+1).winner}]

          var match = new Match(this, teams, matchIdx, !results?null:results[matchIdx])
          matches.push(match)
          return match;
      },
      match: function(id) {
        return matches[id]
      },
      size: function() {
        return matches.length
      },
      render: function() {
        roundCon.empty()
        roundCon.appendTo(bracket.el)
        matches.forEach(function(ma) {
          ma.render() 
        })    
      },
      results: function() {
        var results = []
        matches.forEach(function(ma) {
          results.push(ma.results())
        })
        return results
      }
    }
  }

  var Bracket = function(bracketCon, results, teams)
  {
    var rounds = []

    return {
      el: bracketCon,
      addRound: function() {
        var id = rounds.length
        
        var round = new Round(this, id, !results?null:results[id])
        rounds.push(round)
        return round;
      },
      round: function(id) {
        return rounds[id]
      },
      size: function() {
        return rounds.length
      },
      final: function() {
        return rounds[rounds.length-1].match(0)
      },
      winner: function() {
        return rounds[rounds.length-1].match(0).winner()
      },
      loser: function() {
        return rounds[rounds.length-1].match(0).loser()
      },
      render: function() {
        bracketCon.empty()
        rounds.forEach(function(ro) {
          ro.render() 
        })    
      },
      results: function() {
        var results = []
        rounds.forEach(function(ro) {
          results.push(ro.results())
        })    
        return results
      }
    }
  }

  function isValid(data)
  {
    var t = data.teams 
    var r = data.results

    if (!t) {
      console.log('no teams', data)
      return false
    }

    if (!r)
      return true

    if (t.length < r[0][0].length) {
      console.log('more results than teams', data)
      return false
    }

    for (var b = 0; b < r.length; b++) {
      for (var i = 0; i < ~~(r[b].length/2); i++) {
        if (r[b][2*i].length < r[b][2*i+1].length) {
          console.log('previous round has less scores than next one', data)
          return false
        }
      }
    }

    for (var i = 0; i < r[0].length; i++) {
      if (!r[1] || !r[1][i*2])
        break;

      if (r[0][i].length <= r[1][i*2].length) {
        console.log('lb has more results than wb', data)
        return false
      }
    }

    try {
      r.forEach(function(br) {
        br.forEach(function(ro) {
          ro.forEach(function(ma) {
            if (ma.length != 2) {
              console.log('match size not valid', ma)
              throw 'match size not valid'
            }
            /*logical xor*/
            if (!(isNumber(ma[0])?isNumber(ma[1]):!isNumber(ma[1]))) {
              console.log('mixed results', ma)
              throw 'mixed results'
            }
          })
        })
      })
    }
    catch(e) {
      console.log(e)
      return false
    }

    return true
  }

  function postProcess(container)
  {
    var Track = function(teamIndex, cssClass) {
        var index = teamIndex;
        var elements = container.find('.team[index='+index+']')
        if (!cssClass)
          var addedClass = 'highlight'
        else
          var addedClass = cssClass

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

    var source = f || w

    var winner = source.winner()
    var loser = source.loser()

    var winTrack = null
    var loseTrack = null

    if (winner && loser) {
      winTrack = new Track(winner.idx, 'highlightWinner');
      loseTrack  = new Track(loser.idx, 'highlightLoser');
      winTrack.highlight()
      loseTrack.highlight()
    }

    container.find('.team').mouseover(function() {
        var i = $(this).attr('index') 
        track = new Track(i);
        track.highlight()
        $(this).mouseout(function() {
            track.deHighlight()
            $(this).unbind('mouseout')
          })
      })

  }

  function prepareWinners(winners, data, isSingleElimination)
  {
    var teams = data.teams;
    var results = data.results;
    var rounds = Math.log(teams.length*2) / Math.log(2);
    var matches = teams.length;
    var graphHeight = winners.el.height();

    for (var r = 0; r < rounds; r++) {
      var res = !data.results||!data.results[r]?null:data.results[r]
      var round = winners.addRound(res)

      for (var m = 0; m < matches; m++) {
        var teamCb = null

        if (r === 0) {
          teamCb = function() {
              var t = teams[m]
              var i = m
              return [{source: function() { return {name: t[0], idx: (i*2)} }}, 
                      {source: function() { return {name: t[1], idx: (i*2+1)} }}]
            }
        }

        var match = round.addMatch(teamCb)
      }
      matches /= 2;
    }

    if (isSingleElimination)
      winners.final().connectorCb(function() { return null })
  }

  function prepareLosers(winners, losers, data)
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
          var teamCb = null

          /* special cases */
          if (!(n%2 === 0 && r != 0)) teamCb = function() {
            /* first round comes from winner bracket */
            if (n%2 === 0 && r === 0) {
              return [{source: winners.round(0).match(m*2).loser}, 
                      {source: winners.round(0).match(m*2+1).loser}]
            }
            else { /* match with dropped */
              return [{source: losers.round(r*2).match(m).winner},
                      {source: winners.round(r+1).match(m).loser}]
            }
          }
        
          var match = round.addMatch(teamCb)
          var teamCon = match.el.find('.teamContainer')
          match.setAlignCb(function() {
            teamCon.css('top', (match.el.height()/2-teamCon.height()/2)+'px');
          })

          if (r < rounds-1 || n < 1) {
            var cb = null
            // inside lower bracket 
            if (n%2 === 0) {
              cb = function(tC, match) {
                var connectorOffset = tC.height()/4
                var height = 0;
                var shift = 0;

                if (match.winner().id === 0) {
                  shift = connectorOffset
                }
                else if (match.winner().id === 1) {
                  height = -connectorOffset*2;
                  shift = connectorOffset
                }
                else {
                  shift = connectorOffset*2
                }
                return {height: height, shift: shift}
              }
            }
            match.connectorCb(cb)
          }
        }
      }
      matches /= 2;
    }
  }

  function prepareFinals(finals, winners, losers, data)
  {
    var round = finals.addRound()
    var match = round.addMatch(function() { return [{source: winners.winner}, {source: losers.winner}] })

    match.setAlignCb(function() {
      var height = winners.el.height()+losers.el.height()
      match.el.css('height', (height)+'px');

      var teamCon = match.el.find('.teamContainer')
      var topShift = (winners.el.height()/2 + winners.el.height()+losers.el.height()/2)/2 - teamCon.height()/2 

      teamCon.css('top', (topShift)+'px');
    })

    var shift
    var height

    match.connectorCb(function() { return null })
    
    winners.final().connectorCb(function(tC) {
        var connectorOffset = tC.height()/4
        var topShift = (winners.el.height()/2 + winners.el.height()+losers.el.height()/2)/2 - tC.height()/2 
        var matchupOffset = topShift-winners.el.height()/2
        if (winners.winner().id === 0) {
          height = matchupOffset + connectorOffset*2
          shift = connectorOffset 
        }
        else if (winners.winner().id === 1) {
          height = matchupOffset 
          shift = connectorOffset*3
        }
        else {
          height = matchupOffset+connectorOffset
          shift = connectorOffset*2
        }
        return {height: height, shift: shift}
      })

    losers.final().connectorCb(function(tC) {
        var connectorOffset = tC.height()/4
        var topShift = (winners.el.height()/2 + winners.el.height()+losers.el.height()/2)/2 - tC.height()/2 
        var matchupOffset = topShift-winners.el.height()/2
        if (losers.winner().id === 0) {
          height = matchupOffset
          shift = connectorOffset*3
        }
        else if (losers.winner().id === 1) {
          height = matchupOffset + connectorOffset*2
          shift = connectorOffset
        }
        else {
          height = matchupOffset+connectorOffset
          shift = connectorOffset*2
        }
        return {height: -height, shift: -shift}
      })
  }

  var w, l, f

  var r = data.results
  var isSingleElimination = (r.length <= 1)

  if (isSingleElimination) {
    var wEl = $('<div class="bracket"></div>').appendTo(topCon)
  }
  else {
    var fEl = $('<div class="finals"></div>').appendTo(topCon)
    var wEl = $('<div class="bracket"></div>').appendTo(topCon)
    var lEl = $('<div class="loserBracket"></div>').appendTo(topCon)
  }

  wEl.css('height', data.teams.length*50)

  if (lEl)
    lEl.css('height', wEl.height()/2)

  var rounds
  if (isSingleElimination)
    rounds = Math.log(data.teams.length*2) / Math.log(2)
  else
    rounds = (Math.log(data.teams.length*2) / Math.log(2)-1) * 2 + 1

  topCon.css('width', rounds*140+40)

  w = new Bracket(wEl, !r||!r[0]?null:r[0], data.teams)

  if (!isSingleElimination) {
    l = new Bracket(lEl, !r||!r[1]?null:r[1], null)
    f = new Bracket(fEl, !r||!r[2]?null:r[2], null)
  }

  prepareWinners(w, data, isSingleElimination)

  if (!isSingleElimination) {
    prepareLosers(w, l, data);
    prepareFinals(f, w, l, data);
  }

  renderAll(false)
}

function bracket(opts)
{
  return new jqueryBracket(opts)
}

