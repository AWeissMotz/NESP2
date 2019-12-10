//$(document).foundation();

var buildingSlider = document.getElementById('areaSlider');
noUiSlider.create(buildingSlider, {
    start: [300, 1500],
    connect: true,
    range: {
        'min': [0, 0],
        'max': [3000,3000],
    }
});

var dtgSlider = document.getElementById('dtgSlider');
noUiSlider.create(dtgSlider, {
    start: [300, 1500],
    connect: true,
    range: {
        'min': [0, 0],
        'max': [3000,3000],
    }
});

function national_button_fun() {
  var hidelist = document.getElementsByClassName("n_hide");
  var showlist = document.getElementsByClassName("n_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].style.display = "none";
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].style.display = "block";
  }
  document.getElementById("national").className = "cell small-6 level sidebar__btn active";
  document.getElementById("state").className = "cell small-6 level sidebar__btn";
  document.getElementById("village").className = "cell level sidebar__btn";
}

function state_button_fun() {
  var hidelist = document.getElementsByClassName("s_hide");
  var showlist = document.getElementsByClassName("s_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].style.display = "none";
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].style.display = "block";
  }
  document.getElementById("national").className = "cell small-6 level sidebar__btn";
  document.getElementById("state").className = "cell small-6 level sidebar__btn active";
  document.getElementById("village").className = "cell level sidebar__btn";
}

function village_button_fun() {
  var hidelist = document.getElementsByClassName("v_hide");
  var showlist = document.getElementsByClassName("v_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].style.display = "none";
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].style.display = "block";
  }
  document.getElementById("national").className = "cell small-6 level sidebar__btn";
  document.getElementById("state").className = "cell small-6 level sidebar__btn";
  document.getElementById("village").className = "cell level sidebar__btn active";
}

function states_cb_fun() {
    console.log(window.location.href)
  var checkBox = document.getElementById("statesCheckbox");
  console.log(checkBox);
  var text = document.getElementsByName("statesContent");
  if (checkBox.checked == false){
    if (map.hasLayer(statesLayer)){
      map.removeLayer(statesLayer);
    }
  }

//https://stackoverflow.com/questions/31765968/toggle-url-parameter-with-button

//https://dev.to/gaels/an-alternative-to-handle-global-state-in-react-the-url--3753

//https://stackoverflow.com/questions/13063838/add-change-parameter-of-url-and-redirect-to-the-new-url/13064060
  $.get({url: $SCRIPT_ROOT + "/_add_params",
  data: {states_content: checkBox.checked},
  });


}

function states_radio_fun() {
  var radio = document.getElementsByName("statesGroup");
  var selection = "";
  if (map.hasLayer(statesLayer)){
    map.removeLayer(statesLayer);
  }
  for (i = 0; i < radio.length; i++) {
    if (radio[i].checked == true) {selection = (radio[i].id);}
  }
  if (selection == "gridtrackingCB"){
    statesStyle = statesStyle1;
  }
  if (selection == "remotemappingCB"){
    statesStyle = statesStyle2;
  }
  if (selection == "surveyingCB"){
    statesStyle = statesStyle3;
  }
  if (map.hasLayer(statesLayer) == false){
    map.addLayer(statesLayer);
  }
}

function clusters_cb_fun() {
  var checkBox = document.getElementById("clustersCheckbox");
  var text = document.getElementsByName("clustersContent");
  if (checkBox.checked == true){
    var i;
    for (i = 0; i < text.length; i++) {
      text[i].style.display = "block";
    }
  } else {
    var j;
    for (j = 0; j < text.length; j++) {
      text[j].style.display = "none";
    }
  }
}


function addParameter(url, parameterName, parameterValue, atStart/*Add param before others*/){
    replaceDuplicates = true;
    if(url.indexOf('#') > 0){
        var cl = url.indexOf('#');
        urlhash = url.substring(url.indexOf('#'),url.length);
    } else {
        urlhash = '';
        cl = url.length;
    }
    sourceUrl = url.substring(0,cl);

    var urlParts = sourceUrl.split("?");
    var newQueryString = "";

    if (urlParts.length > 1)
    {
        var parameters = urlParts[1].split("&");
        for (var i=0; (i < parameters.length); i++)
        {
            var parameterParts = parameters[i].split("=");
            if (!(replaceDuplicates && parameterParts[0] == parameterName))
            {
                if (newQueryString == "")
                    newQueryString = "?";
                else
                    newQueryString += "&";
                newQueryString += parameterParts[0] + "=" + (parameterParts[1]?parameterParts[1]:'');
            }
        }
    }
    if (newQueryString == "")
        newQueryString = "?";

    if(atStart){
        newQueryString = '?'+ parameterName + "=" + parameterValue + (newQueryString.length>1?'&'+newQueryString.substring(1):'');
    } else {
        if (newQueryString !== "" && newQueryString != '?')
            newQueryString += "&";
        newQueryString += parameterName + "=" + (parameterValue?parameterValue:'');
    }
    return urlParts[0] + newQueryString + urlhash;
};