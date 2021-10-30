var champData = []
var scriptData = {}
var version

function setTheme(overwrite = false) {
  var dark = overwrite ?
    overwrite :
    document.getElementById('theme').checked == true
  document.body.style.cssText = dark ?
    '--main-background-color: #232323;--main-font-color: rgba(255, 255, 255, 0.87);--script-bg-color: #232323' :
    '  --main-background-color: #fff;--main-font-color: rgba(0, 0, 0, 0.87);--script-bg-color: rgb(250, 250, 250)'
  document.getElementById('themeLabel').innerHTML = dark ?
    'Dark Theme' :
    'Bright Theme'
  document.getElementById('recaptcha').setAttribute("data-theme", dark ? "dark" : "light")
  if (localStorage) {
    localStorage.setItem('dark', dark)
  }
}

//Demo Data for now
function loadScripts() {
  for (i = 0; i < champData.length; i++) {
    var count = Math.floor(Math.random() * 4)
    for (c = 0; c < count; c++) {
      scriptData[champData[i].systemName] =
        scriptData[champData[i].systemName] || []
      scriptData[champData[i].systemName].push({
        name: 'Script' + c,
        author: 'Author' + c,
        download: 'http://goo.gl/4qagA1',
        thread: 'http://goo.gl/4qagA1',
        stars: Math.floor(Math.random() * 5) + 1
      })
    }
  }
}

if (localStorage && localStorage.dark) {
  document.getElementById('theme').checked = localStorage.dark == 'true'
  setTheme(localStorage.dark == 'true')
}

function loadJSON(path, success, error) {
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success) success(JSON.parse(xhr.responseText))
      } else {
        if (error) error(xhr)
      }
    }
  }
  xhr.open('GET', path, true)
  xhr.send()
}

var elem = document.querySelector('.collapsible')
M.Collapsible.init(elem)

var elem = document.querySelectorAll('.tooltipped')
M.Tooltip.init(elem)

var elem = document.querySelector('#addScript')
M.Modal.init(elem)

var elem = document.querySelector('.modal.bottom-sheet')
M.Modal.init(elem, {
  onCloseEnd: function () {
    document.getElementById('modalChampImg').src = ''
  }
})

function renderChamps(data, firstRun = false) {
  var str = ''
  for (i = 0; i < data.length; i++) {
    str += `<div class="col s6 m6 l3 xl2 hoverable champWrapper" onclick=showChamp("${
      data[i].systemName
    }")>
            <div class="champImgWrapper">
              <img class="circle champImg" ${
                firstRun ? 'data-' : ''
              }src="https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${
      data[i].systemName
    }.png"><span class="badge ${
      scriptData[data[i].systemName]
        ? ''
        : 'grey darken-3 grey-text text-darken-2'
    }">${
      scriptData[data[i].systemName] ? scriptData[data[i].systemName].length : 0
    }</span>
            </div>
            <p class="flow-text truncate">${data[i].name}</p>
        </div>`
  }
  document.querySelector('#list').innerHTML = str
  if (!firstRun) return;
  [].forEach.call(document.querySelectorAll('img[data-src]'), function (img) {
    img.setAttribute('src', img.getAttribute('data-src'))
    img.onload = function () {
      img.removeAttribute('data-src')
    }
  })
}

document.getElementById('searchField').addEventListener('keyup', filterData)

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function filterData() {
  //Search
  var filter = document.getElementById('searchField').value.toLowerCase()
  var checkboxes = document.querySelectorAll('input[name="roleFilter"]:checked')
  if (!checkboxes) return renderChamps([])
  var newList = []
  for (i = 0; i < champData.length; i++) {
    if (
      champData[i].name.toLowerCase().includes(filter) ||
      champData[i].systemName.toLowerCase().includes(filter)
    ) {
      if (checkboxes.length == 6) {
        newList.push(champData[i])
      } else {
        for (l = 0; l < checkboxes.length; l++) {
          if (champData[i].tags.includes(checkboxes[l].value)) {
            newList.push(champData[i])
            break;
          }
        }
      }
    }
  }
  window.scrollTo(0, 0)
  renderChamps(newList)
}

function showChamp(champName) {
  var instance = M.Modal.getInstance(elem)

  var champ = champData.filter(champ => champ.systemName == champName)[0]

  if (!champ) return

  document.getElementById('modalChampName').innerHTML = champ.name
  document.getElementById('modalChampTitle').innerHTML = champ.title
  var img = document.getElementById('modalChampImg')
  img.setAttribute(
    'data-src',
    'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/' +
    champ.systemName +
    '_0.jpg'
  )

  img.setAttribute('src', img.getAttribute('data-src'))
  img.onload = function () {
    img.removeAttribute('data-src')
  }

  //CARE FOR XSS!
  var script = scriptData[champ.systemName] || []
  var str =
    script.length == 0 ?
    '<div class="center noFound"><span class="flow-text nonFound grey-text text-darken-2">No scripts found for ' +
    champ.name +
    '</span><div>' :
    ''
  for (i = 0; i < script.length; i++) {
    var stars = scriptData[champ.systemName][i].stars
    str += `<li class="collection-item avatar">
        <a href="${script[i].download}">
            <i class="material-icons circle tooltipped" data-position="bottom" data-tooltip="Download Script">file_download</i>
        </a>
        <a href="${script[i].thread}">
            <i class="material-icons circle thread tooltipped" data-position="bottom" data-tooltip="Visit Thread">web</i>
        </a>
        <div class="scriptInfo">
          <span class="title">${script[i].name}</span>
          <p>by ${script[i].author}</p>
        </div>
        <a href="#!" class="secondary-content" onmouseleave="resetStars(this)" original-stars="${stars}">${'<i class="material-icons" onclick="vote(this)" onmouseover="hoverStar(this)">star</i>'.repeat(
      stars
    )}${'<i class="material-icons" onmouseover="hoverStar(this)" onclick="vote(this)">star_outline</i>'.repeat(
      5 - stars
    )}
        </a>
        </li>
        `
  }

  document.getElementById('scripts').innerHTML = str

  instance.open()

  M.Tooltip.init(
    document.querySelectorAll('li.collection-item.avatar .tooltipped')
  )
}

function hoverStar(element) {
  var parent = element.parentNode
  var spot = [...element.parentNode.children].indexOf(element)
  for (i = 0; i < 5; i++) {
    parent.childNodes[i].innerHTML = i <= spot ? 'star' : 'star_outline'
  }
}

function resetStars(element) {
  //Get Starts
  var stars = element.getAttribute('original-stars') - 1
  for (i = 1; i <= 5; i++) {
    element.childNodes[i].innerHTML = i <= stars ? 'star' : 'star_outline'
  }
}

function vote(element) {
  var rating = [...element.parentNode.children].indexOf(element) + 1
  M.toast({
    html: '<i class="material-icons yellow-text">star</i> You gave ' +
      rating +
      ' stars to ' +
      element.parentNode.parentNode.children[2].children[0].innerHTML
  })
}

if (localStorage && localStorage.champData && localStorage.version) {
  version = localStorage.version
  loadScripts()
  renderChamps(JSON.parse(localStorage.champData), true)
}

function loadAddScript() {
  var elem = document.querySelector('input.autocomplete.notInit')
  if (!elem) return
  elem.classList.remove('notInit')
  M.Autocomplete.init(elem, {
    onAutocomplete: function (value) {
      document.getElementById('autocompletePrefix').src =
        'https://ddragon.leagueoflegends.com/cdn/' +
        version +
        '/img/champion/' +
        value +
        '.png'
    },
    minLength: 2,
    data: champData.map(a => a.systemName).reduce(function (obj, value) {
      obj[value] =
        'https://ddragon.leagueoflegends.com/cdn/' +
        version +
        '/img/champion/' +
        value +
        '.png'
      return obj
    }, {})
  })

  var script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://www.google.com/recaptcha/api.js'

  document.getElementsByTagName('head')[0].appendChild(script)
}

var solveKey;

function captchaSolve(key) {
  solveKey = key
  document.getElementById('sender').classList.remove("disabled")
}

function sendData() {
  if (document.getElementById('sender').disabled) return;
  var postData = [...document.querySelectorAll('#addScript input')].reduce((obj, item) => {
    obj[item.id] = item.value
    return obj
  }, {})
  postData.captcha = solveKey
  console.log(postData)
}

loadJSON(
  'https://ddragon.leagueoflegends.com/api/versions.json',
  function (data) {
    version = data[0]
    loadJSON(
      'https://ddragon.leagueoflegends.com/cdn/' +
      version +
      '/data/en_US/champion.json',
      function (data) {
        for (champ in data.data) {
          var champObject = data.data[champ]
          champData.push({
            tags: champObject.tags,
            systemName: champ,
            name: champObject.name,
            title: capitalizeFirstLetter(champObject.title)
          })
        }
        loadScripts()
        renderChamps(
          champData,
          localStorage && localStorage.champData ? true : true
        )
        filterData()
        if (localStorage) {
          localStorage.setItem('champData', JSON.stringify(champData))
          localStorage.setItem('version', version)
        }
      },
      function (error) {
        console.error(error)
      }
    )
  },
  function (error) {
    console.error(error)
  }
)