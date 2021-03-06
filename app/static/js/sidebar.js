var options = {
  center: [9, 7],
  zoomSnap: 0.5,
  zoom: 6.6,
  minZoom: 6,
  maxZoom: 19,
  zoomControl: false
};
var map = L.map("map", options);
var level = "national";
var previous_level = level;
var statesList = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];
var selectedState = "init";
var prevState = selectedState;
var selectedStateOptions = {bounds: null};
var filteredClusters = 0;
var filteredOgClusters = 0;
var selectedLGA = "";
var thirtythreeKV = "33_kV_" + selectedState.toLowerCase();
var centroids_layer_id = -1;
var current_cluster_centroids = Object();
var filtered_centroids_keys = [];
var currently_featured_centroid_id = 0;
var flying_to_next_cluster = false;
var statesWithOgClusters = [
    'Jigawa',
     'Kano',
     'Katsina',
     'Sokoto',
     'Kebbi',
     'Nasarawa',
     'Edo',
     'Osun',
     'Enugu',
     'Kogi',
     'Kwara'
];

var currentfilter = {
  minarea: 0.1,
  maxarea: 10,
  mindtg: 0,
  maxdtg: 50,
  ogminarea: 0.1,
  ogmaxarea: 10,
  ogmindtg: 0,
  ogmaxdtg: 100,
  ogminb: 0,
  ogmaxb: 5000,
  ogminbfp: 0,
  ogmaxbfp: 0.8,
};
var gridLayers = {
  "Abia": "",
  "Adamawa": "",
  "Akwa Ibom": "",
  "Anambra": "",
  "Bauchi": "",
  "Bayelsa": "",
  "Benue": "",
  "Borno": "",
  "Cross River": "",
  "Delta": "",
  "Ebonyi": "",
  "Edo": "",
  "Ekiti": "",
  "Enugu": "nesp2_state_grid_enugu",
  "Federal Capital Territory": "",
  "Gombe": "",
  "Imo": "",
  "Jigawa": "nesp2_state_grid_jigawa",
  "Kaduna": "nesp2_state_grid_kaduna",
  "Kano": "nesp2_state_grid_kano",
  "Katsina": "nesp2_state_grid_katsina",
  "Kebbi": "nesp2_state_grid_kebbi",
  "Kogi": "",
  "Kwara": "",
  "Lagos": "",
  "Nasarawa": "nesp2_state_grid_nasarawa",
  "Niger": "",
  "Ogun": "",
  "Ondo": "",
  "Osun": "nesp2_state_grid_osun",
  "Oyo": "",
  "Plateau": "",
  "Rivers": "",
  "Sokoto": "nesp2_state_grid_sokoto",
  "Taraba": "",
  "Yobe": "",
  "Zamfara": "nesp2_state_grid_zamfara",
};

var OGClusterLayers = {
  "Abia": "nesp2_state_offgrid_clusters_abia",
  "Adamawa": "",
  "Akwa Ibom": "",
  "Anambra": "nesp2_state_offgrid_clusters_anambra",
  "Bauchi": "nesp2_state_offgrid_clusters_bauchi",
  "Bayelsa": "",
  "Benue": "nesp2_state_offgrid_clusters_benue",
  "Borno": "",
  "Cross River": "",
  "Delta": "nesp2_state_offgrid_clusters_delta",
  "Ebonyi": "",
  "Edo": "nesp2_state_offgrid_clusters_edo",
  "Ekiti": "nesp2_state_offgrid_clusters_ekiti",
  "Enugu": "nesp2_state_offgrid_clusters_enugu",
  "Federal Capital Territory": "nesp2_state_offgrid_clusters_federal_capital_territory",
  "Gombe": "",
  "Imo": "",
  "Jigawa": "nesp2_state_offgrid_clusters_jigawa",
  "Kaduna": "nesp2_state_offgrid_clusters_kaduna",
  "Kano": "nesp2_state_offgrid_clusters_kano",
  "Katsina": "nesp2_state_offgrid_clusters_katsina",
  "Kebbi": "nesp2_state_offgrid_clusters_kebbi",
  "Kogi": "nesp2_state_offgrid_clusters_kogi",
  "Kwara": "nesp2_state_offgrid_clusters_kwara",
  "Lagos": "",
  "Nasarawa": "nesp2_state_offgrid_clusters_nasarawa",
  "Niger": "nesp2_state_offgrid_clusters_niger",
  "Ogun": "nesp2_state_offgrid_clusters_ogun",
  "Ondo": "nesp2_state_offgrid_clusters_ondo",
  "Osun": "nesp2_state_offgrid_clusters_osun",
  "Oyo": "nesp2_state_offgrid_clusters_oyo",
  "Plateau": "nesp2_state_offgrid_clusters_plateau",
  "Rivers": "",
  "Sokoto": "nesp2_state_offgrid_clusters_sokoto",
  "Taraba": "",
  "Yobe": "nesp2_state_offgrid_clusters_yobe",
  "Zamfara": "nesp2_state_offgrid_clusters_zamfara",
}

// fetch info about states which have og_clusters
$.post({
    url: "/states-with-og-clusters",
    dataType: "json",
    success: function(data){statesWithOgClusters=data.states_with_og_clusters;},
})

function give_status(context=null) {
    console.log("Status on");
    if (context) {
        console.log(context);
    };
    console.log("    level " + level);
    console.log("    prevLevel " + previous_level);
    console.log("    State " + selectedState);
    console.log("    prevState " + prevState);
    console.log("Status over");
};

function resetStateSelect() {
  prevState = selectedState;
  selectedState = "init";
  var s = document.getElementById('stateSelect');
  s.options[0].selected = true;
}

var sliderOptions = {
  connect: true,
  tooltips: true,
  format: wNumb({
    decimals: 2
  }),
};



// TODO: maybe redundant could use the same function for all sliders
function changeAreaSlider(str, h, values) {
  currentfilter.minarea = values[0];
  currentfilter.maxarea = values[1];
  map.fireEvent("filterchange", currentfilter);
};
var areaSlider = document.getElementById('areaSlider');
noUiSlider.create(areaSlider, {
  ...sliderOptions,
  start: [0.1, 10],
  range: {
    'min': [0, 0.05],
    '40%': [1, 0.5],
    '70%': [10, 1],
    '90%': [100, 100],
    'max': 1100,
  },
});
areaSlider.noUiSlider.on("change", changeAreaSlider);
areaSlider.noUiSlider.on("end", update_filter);

function changedtgSlider(str, h, values) {
  currentfilter.mindtg = values[0];
  currentfilter.maxdtg = values[1];
  map.fireEvent("filterchange", currentfilter);
};


var dtgSlider = document.getElementById('dtgSlider');
noUiSlider.create(dtgSlider, {
  ...sliderOptions,
  start: [0, 100],
  range: {
    'min': [0, 0.1],
    '20%': [1, 0.5],
    '50%': [10, 1],
    'max': 50,
  }
});
dtgSlider.noUiSlider.on("change", changedtgSlider);
dtgSlider.noUiSlider.on("end", update_filter);

function changeogAreaSlider(str, h, values) {
  currentfilter.ogminarea = values[0];
  currentfilter.ogmaxarea = values[1];
  map.fireEvent("ogfilterchange", currentfilter);
};
var ogAreaSlider = document.getElementById('ogAreaSlider');
noUiSlider.create(ogAreaSlider, {
  ...sliderOptions,
  start: [0, 1000000],
  range: {
    'min': [0, 0.01],
    '70%': [0.5, 0.05],
    'max': 3.5,
  }
});
ogAreaSlider.noUiSlider.on("change", changeogAreaSlider);
ogAreaSlider.noUiSlider.on("end", update_og_filter);


function changeogDistanceSlider(str, h, values) {
  currentfilter.ogmindtg = values[0];
  currentfilter.ogmaxdtg = values[1];
  map.fireEvent("ogfilterchange", currentfilter);
};
var ogDistanceSlider = document.getElementById('ogDistanceSlider');
noUiSlider.create(ogDistanceSlider, {
  start: [5, 1000],
  ...sliderOptions,
  range: {
    'min': [0, 0.1],
    '25%': [5, 0.5],
    '75%': [10, 1],
    'max': 50,
  }
});
ogDistanceSlider.noUiSlider.on("change", changeogDistanceSlider);
ogDistanceSlider.noUiSlider.on("end", update_og_filter);

function changeogBuildingsSlider(str, h, values) {
  currentfilter.ogminb = values[0];
  currentfilter.ogmaxb = values[1];
  map.fireEvent("ogfilterchange", currentfilter);
};
var ogBuildingsSlider = document.getElementById('ogBuildingsSlider');
noUiSlider.create(ogBuildingsSlider, {
  start: [0, 5000],
  ...sliderOptions,
  range: {
    'min': [0, 1],
    '10%': [10, 1],
    '30%': [100, 10],
    '80%': [1000, 100],
    'max': 11000,
  }
});
ogBuildingsSlider.noUiSlider.on("change", changeogBuildingsSlider);
ogBuildingsSlider.noUiSlider.on("end", update_og_filter);

function changeogBuildingsFootprintSlider(str, h, values) {
  currentfilter.ogminbfp = values[0];
  currentfilter.ogmaxbfp = values[1];
  map.fireEvent("ogfilterchange", currentfilter);
};
var ogBuildingsFootprintSlider = document.getElementById('ogBuildingsFootprintSlider');
noUiSlider.create(ogBuildingsFootprintSlider, {
  start: [0, 0.8],
  ...sliderOptions,
  range: {
    'min': [0, 0.01],
    '50%': [0.1, 0.01],
    '75%': [0.2, 0.05],
    'max': 1,
  }
});
ogBuildingsFootprintSlider.noUiSlider.on("change", changeogBuildingsFootprintSlider);
ogBuildingsFootprintSlider.noUiSlider.on("end", update_og_filter);



function update_filter() {
    if (selectedState != "init") {
        $.post({
                url: "/filtered-cluster",
                dataType: "json",
                data: {"cluster_type": "all", "state_name": selectedState, ... currentfilter},
                success: function(data){console.log(data);filteredClusters=data;},
             }).done(
                function(data) {
                    console.log("THERE")
                    var filter_title = $("#n_clusters");
                    var new_text = "= " + filteredClusters + " settlements";
                    if (filteredClusters == 1){
                        new_text = "= " + filteredClusters + " settlement";
                    };
                    filter_title.text(new_text);
                    filter_title = $("#filtered-clusters-num");
                    filter_title.text(filteredClusters);
                }
        );
    }
};

function update_og_filter() {
    if (selectedState != "init") {
        $.post({
            url: "/filtered-cluster",
            dataType: "json",
            data: {"cluster_type": "og", "state_name": selectedState, ... currentfilter},
            success: function(data){filteredOgClusters=data;},
        }).done(
            function(data) {
                var filter_title = $("#n_ogclusters");
                var new_text = "= " + filteredOgClusters + " settlements";
                if (filteredOgClusters > 1){
                    new_text = "= " + filteredOgClusters + " settlement"
                };
                filter_title.text(new_text);
                filter_title = $("#filtered-clusters-num");
                filter_title.text(filteredOgClusters);
            }
        );
    }
};

function set_toggle_value(toggle_id, value) {
    document.getElementById(toggle_id).checked = value;
};

function set_clusters_toggle(value) {
    set_toggle_value("clustersCheckbox", value)
};

function set_og_clusters_toggle(value) {
    set_toggle_value("ogClustersCheckbox", value)
};

function disable_sidebar__btn(className) {
  let answer = className;
  if (className.includes(" is-disabled")) {} else {
    className = className + " is-disabled";
  }
  return className;
};

function enable_sidebar__btn(className) {
  let answer = className;
  if (className.includes(" is-disabled")) {
    className = className.replace(" is-disabled", "");
  }
  return className;
};

function hide_sidebar__btn(className) {
  let answer = className;
  if (className.includes(" is-hidden")) {} else {
    className = className + " is-hidden";
  }
  return className;
};

function show_sidebar__btn(className) {
  let answer = className;
  if (className.includes(" is-disabled")) {
    className = className.replace(" is-disabled", "");
  }
  if (className.includes(" is-hidden")) {
    className = className.replace(" is-hidden", "");
  }
  return className;
};


function disable_sidebar_filter(className) {
  return className.replace(" active-filter", " hidden-filter");
};

function toggle_sidebar_filter(className) {
  let answer = className;
  if (className.includes(" hidden-filter")) {
    className = enable_sidebar_filter(className);
  } else if (className.includes(" active-filter")) {
    className = disable_sidebar_filter(className);
  }
  return className;
};

function enable_sidebar_filter(className) {
  return className.replace(" hidden-filter", " active-filter");
};


function adapt_sidebar_to_selection_level(selectionLevel) {

  var level_id = selectionLevel.charAt(0)
  // hide and show elements according to their classes
  var hidelist = document.getElementsByClassName(level_id + "_hide");
  var greylist = document.getElementsByClassName(level_id + "_grey");
  var showlist = document.getElementsByClassName(level_id + "_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].className = hide_sidebar__btn(hidelist[i].className);
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].className = show_sidebar__btn(showlist[j].className)
  }
  for (k = 0; k < greylist.length; k++) {
    greylist[k].className = disable_sidebar__btn(greylist[k].className)
  }

  document.getElementById("national").className = "cell small-6 level sidebar__btn";
  document.getElementById("state").className = "cell small-6 level sidebar__btn";
  document.getElementById("village").className = "cell small-6 level sidebar__btn";

  document.getElementById(selectionLevel).className = "cell small-6 level sidebar__btn active";
};

function adapt_view_to_national_level() {
  give_status("adapt_view_to_national_level");
  map.setMinZoom(6.5);
  map.options.maxZoom = 9;
  map.options.zoomSnap = 0.5;

  legend.addTo(map);
  gridLegend.remove();
  clusterInfo.remove();

  // load the states boundaries
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();
  // load the populated areas
  document.getElementById("heatmapCheckbox").checked = true;
  heatmap_cb_fun();
  // load the medium voltage grid
  document.getElementById("nationalGridCheckbox").checked = true;
  nationalGrid_cb_fun();
  // hide the remotely mapped villages clusters
  if (selectedState == "init" && prevState == "init") {
    set_clusters_toggle(false);
    set_og_clusters_toggle(false);
  }
  clusters_cb_fun();
  ogClusters_cb_fun();
  // Remotely mapped villages layer
  remove_layer(clusterLayer[selectedState]);
  remove_layer(ogClusterLayers[selectedState]);

  // reset the selected state to "init"
  resetStateSelect()
  remove_layer(selected_state_pbf);

  // Trigger the filter function so that all geojson state are available again
  if (selectedState == "init" && prevState != "init") {
    update_nigeria_states_geojson();
  }

  remove_basemaps();

  map.addLayer(osm_gray);
  map.addLayer(national_background);

  // Linked to the checkbox Grid
  remove_layer(grid_layer);

  // reactive fitting of Nigeria on the map
  map.fitBounds(L.latLngBounds(L.latLng(14, 15), L.latLng(4, 2.5)))
  // if the fitBound has smaller zoom level, update the min zoom level
  map.setMinZoom(map.getZoom());

};

function adapt_view_to_state_level() {
  give_status("adapt_view_to_state_level");


  map.options.minZoom = 8;
  map.options.maxZoom = 18;
  map.options.zoomSnap = 1,

  legend.remove();
  gridLegend.addTo(map);

  // load the states boundaries
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();
  document.getElementById("gridCheckbox").checked = true;
  // Load the remotely mapped villages clusters
  if (previous_level == "national" && prevState == "init") {
    set_og_clusters_toggle(true);
  }
  clusters_cb_fun();
  ogClusters_cb_fun();


  update_selected_state_pbf()
  update_grid_layer();
  //update_ogclustersTileLayer();
  add_layer(osm_gray);

  // remove the medium voltage grid
  document.getElementById("heatmapCheckbox").checked = false;
  heatmap_cb_fun();
  // remove the populated areas
  document.getElementById("nationalGridCheckbox").checked = false;
  nationalGrid_cb_fun();

  remove_layer(hot);

  remove_basemaps_except_osm_gray();
};

function adapt_view_to_village_level() {
  give_status("adapt_view_to_village_level");
  remove_layer(osm_gray);
  infoBox.remove();
  add_layer(hot);
};

/*
 * triggered by the click on the level buttons
 */

function national_button_fun(trigger="button") {
  level = "national";
  adapt_sidebar_to_selection_level(level);
  adapt_view_to_national_level()
}

function state_button_fun(trigger="button") {
  previous_level = level
  level = "state";
  adapt_sidebar_to_selection_level(level);

  // click on the state level button from national level
  if (previous_level == "national" && trigger == "button"){
      // select a random state which has off-grid clusters
      selectedState = statesWithOgClusters[Math.floor(Math.random()*statesWithOgClusters.length)]
      // Update the states menu list
      document.getElementById("stateSelect").value = selectedState;
  };

  // updates the bounds of the selected state's layer
  updateSelectedStateBounds()
  // manages the layers for the state level
  adapt_view_to_state_level();

  // When coming from village to state level it should not zoom out to the selected state
  if (previous_level == "national" || previous_level == "state" || (previous_level == "village" && trigger == "map-click")) {
    zoomToSelectedState();
    var numSelectedClusters = null;
    if (document.getElementById("clustersCheckbox").checked == true){
        update_filter();
        numSelectedClusters = filteredClusters;
    }
    if (document.getElementById("ogClustersCheckbox").checked == true) {
        update_og_filter();
        numSelectedClusters = filteredOgClusters;
    }
    // Trigger the filter function so that the selected state geojson does not hide the clusters
    update_nigeria_states_geojson()
    if (numSelectedClusters !== null) {
        update_clusterInfo({}, numSelectedClusters)
    }

  };
  if (previous_level == "village" && (trigger == "button" || trigger == "zoom")) {
    if (trigger != "zoom") {
        zoomToSelectedState();
    };
    randomClusterInfo.remove()
  }
  else{
    if (trigger != "random-cluster"){
        randomClusterInfo.remove()
    }

  }
};

function village_button_fun(trigger="button") {
  previous_level = level
  level = "village";
  adapt_sidebar_to_selection_level(level);
  // click on the village level button from national level, first select a random state
  if (previous_level == "national" && trigger == "button"){
      // select a random state which has off-grid clusters
      selectedState = statesWithOgClusters[Math.floor(Math.random()*statesWithOgClusters.length)]

      // Update the states menu list
      document.getElementById("stateSelect").value = selectedState;
      updateSelectedStateBounds()

      // Trigger the filter function so that the selected state geojson does not hide the clusters
      update_nigeria_states_geojson()

  };
  // click on the village level button from national or state level
  if ((previous_level == "national" || previous_level == "state") && trigger == "button"){
    //pick a random cluster among the large ones and display it
    get_random_ogCluster_fun()
  };

  adapt_view_to_village_level();

};

// Triggered by the national and state views
function states_cb_fun() {
  var sCheckBox = document.getElementById("statesCheckbox")
  if (sCheckBox.checked == true) {
    add_layer(statesLayer)
    add_layer(nigeria_states_geojson)
  } else {
    remove_layer(statesLayer)
    remove_layer(nigeria_states_geojson)
  }



  //https://stackoverflow.com/questions/31765968/toggle-url-parameter-with-button
  //https://dev.to/gaels/an-alternative-to-handle-global-state-in-react-the-url--3753
  //https://stackoverflow.com/questions/13063838/add-change-parameter-of-url-and-redirect-to-the-new-url/13064060
  /*$.get({url: $SCRIPT_ROOT,
  data: {
        grid_content: gCheckBox.checked,
        states_content: sCheckBox.checked,
  },
  });
*/
}

// Triggered by user interaction of the stateSelect dropdown menu
function state_dropdown_fun() {
  // Work only if the selected state is different than the currenlty selected
  if (selectedState != document.getElementById("stateSelect").value) {
    prevState = selectedState;
    //update the selected state
    selectedState = document.getElementById("stateSelect").value;
    // update the centroids layer to the newly selected state
    update_centroids_group();
    //Trigger the switch to state level
    state_button_fun(trigger="menu");
  }
};

// Triggered by the checkbox Populated Areas
function heatmap_cb_fun() {
  var checkBox = document.getElementById("heatmapCheckbox");
  if (checkBox.checked == true) {
    document.getElementById("heatmapPanel").style.borderLeft = '.25rem solid #1DD069';
    add_layer(national_heatmap);
  } else {
    document.getElementById("heatmapPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(national_heatmap);
    national_heatmap.bringToFront();
  }
}

// Triggered by the checkbox Medium Voltage Grid
function nationalGrid_cb_fun() {
  var checkBox = document.getElementById("nationalGridCheckbox");
  if (checkBox.checked == true) {
    document.getElementById("nationalGridPanel").style.borderLeft = '.25rem solid #1DD069';
    add_layer(national_grid);
  } else {
    document.getElementById("nationalGridPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(national_grid);
  }
}
var random_cluster = false;
//pick a random cluster among the large ones and display it
function get_random_ogCluster_fun() {

    $.post({
            url: "/random-cluster",
            dataType: "json",
            data: {"state_name": selectedState},
            success: function(data){
                random_cluster = true;
                randomClusterInfo.update = function() {
                    this._div.innerHTML = '<div class="random-cluster__info">Click on the cluster to show its information</div>';
                    this._div.innerHTML;
                };
                randomClusterInfo.addTo(map);
                //this will trigger a fly to the point
                map.flyTo(L.latLng(data.lat, data.lng), 14);
            }
    }).done(function (data) {random_cluster = false;});
}
function download_clusters_fun() {
  var export_csv_link = document.getElementById("export_csv")

  var checkBox = document.getElementById("clustersCheckbox");
  // currently there are only two filters which are mutually exclusive
  if (checkBox.checked == true){

    export_csv_link.href = "/csv-export"
    + "?state=" + selectedState
    + "&cluster_type=cluster"
    + "&min_area=" + currentfilter.minarea
    + "&max_area=" + currentfilter.maxarea
    + "&mindtg=" + currentfilter.mindtg
    + "&maxdtg=" + currentfilter.maxdtg
  }
  else{

    export_csv_link.href = "/csv-export"
    + "?state=" + selectedState
    + "&cluster_type=ogcluster"
    + "&ogmin_area=" + currentfilter.ogminarea
    + "&ogmax_area=" + currentfilter.ogmaxarea
    + "&ogmindtg=" + currentfilter.ogmindtg
    + "&ogmaxdtg=" + currentfilter.ogmaxdtg
    + "&ogminb=" + currentfilter.ogminb
    + "&ogmaxb=" + currentfilter.ogmaxb
    + "&ogminbfp=" + currentfilter.ogminbfp
    + "&ogmaxbfp=" + currentfilter.ogmaxbfp
  }
  export_csv_link.click()
}

function clusters_cb_fun() {

  if (prevState != "init") {
    remove_layer(clusterLayer[prevState])
  }
  if (document.getElementById("clustersCheckbox").checked == true) {
    // set panel side to green
    document.getElementById("clustersPanel").style.borderLeft = '.25rem solid #1DD069';
    // deactivate og clusters
    set_og_clusters_toggle(false);
    ogClusters_cb_fun();

    add_layer(clusterLayer[selectedState]);

    // update the number of clusters available
    update_filter()
    update_clusterInfo({}, filteredClusters)

    // Update centroids for all_clusters
    update_centroids();
  } else {
  // set panel side to grey
    document.getElementById("clustersPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(clusterLayer[selectedState]);
    // Close the filters if they were available
    clusters_filter_fun();
    if(document.getElementById("ogClustersCheckbox").checked == false) {
        clusterInfo.remove()
    }

  }

  /*$.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
    states_content: stateCheckBox.checked
  },
  });
  */
}

function template_filter_fun(id) {
  var newFilter = document.getElementsByName(id + "Content");
  var checkBox = document.getElementById(id + "Checkbox");
  if (checkBox.checked == true) {
    var i;
    for (i = 0; i < newFilter.length; i++) {
      newFilter[i].className = toggle_sidebar_filter(newFilter[i].className)
    }

    var prevFilter = document.querySelectorAll(".content-filter");
    var j;
    for (j = 0; j < prevFilter.length; j++) {

      if (prevFilter[j].attributes.name.value !== id + "Content") {
        prevFilter[j].className = disable_sidebar_filter(prevFilter[j].className);
      }
    }
    if (id == "clusters") {
        map.fireEvent("filterchange", currentfilter);
        update_filter();
    }
    else{
        map.fireEvent("ogfilterchange", currentfilter);
        update_og_filter();
    }
  } else {
    var prevFilter = document.querySelectorAll(".content-filter");
    var j;
    for (j = 0; j < prevFilter.length; j++) {

      if (prevFilter[j].attributes.name.value === id + "Content") {
        prevFilter[j].className = disable_sidebar_filter(prevFilter[j].className);
      }
    }

  }
}

function clusters_filter_fun() {
  template_filter_fun("clusters");
}


function ogClusters_cb_fun() {
  if (prevState != "init") {
    remove_layer(ogClusterLayers[prevState])
  }
  var checkBox = document.getElementById("ogClustersCheckbox");
  if (checkBox.checked == true) {
    // set panel side to green
    document.getElementById("ogClustersPanel").style.borderLeft = '.25rem solid #1DD069';
    // deactivate clusters
    set_clusters_toggle(false);
    clusters_cb_fun();

    add_layer(ogClusterLayers[selectedState]);

    // update the number of clusters available
    update_og_filter()
    update_clusterInfo({}, filteredOgClusters)
    // Update centroids for og_clusters
    update_centroids();
  } else {
  // set panel side to grey
    document.getElementById("ogClustersPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(ogClusterLayers[selectedState]);
    // Close the filters if they were available
    ogClusters_filter_fun();
    if(document.getElementById("clustersCheckbox").checked == false) {
        clusterInfo.remove()
    }
  }
}

function ogClusters_filter_fun() {
  template_filter_fun("ogClusters");
}


// Triggered by the checkbox Grid
function grid_cb_fun() {
  var checkBox = document.getElementById("gridCheckbox");
  if (checkBox.checked == true) {
    document.getElementById("gridPanel").style.borderLeft = '.25rem solid #1DD069';
    add_layer(grid_layer);
  } else {
    document.getElementById("gridPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(grid_layer);
  }

  /*$.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
    states_content: stateCheckBox.checked
  },
  });*/
}

function buildingDensity_cb_fun() {
  var checkBox = document.getElementById("buildingDensityCheckbox");
  if (checkBox.checked == true) {
    add_layer(buildingDensity)
  } else {
    remove_layer(buildingDensity)
  }
}

// The following functions allow to asynchronously call geojson files and create a layer with them
// Handling is made somewhat difficult: due to asynchronous nature of the call the data cannot simply
// be stored in a variable. Therefore the data are used to create a geojson-layer in a layergroup.
// The layer can then be selected via it's _leaflet_id

// Function asynchronously calls geojsons with centroids of selected state
function update_centroids_data(handleData){
  var centroids_file_key = selectedState
  if (selectedState == "init"){
    centroids_file_key = "Kano";
  }
  if (document.getElementById("clustersCheckbox").checked == false){
    $.ajax({
      url: "/static/data/centroids/nesp2_state_offgrid_clusters_centroids_" + title_to_snake(centroids_file_key) + ".geojson",
      dataType: "json",
      success: function(data) {
        // handleData allows this function to be called in another function
        handleData(data);
      },
      error: function (xhr) {
        console.log(xhr.statusText);
        console.log("loading of geojson failed");
      }
    })
  }
  else if (document.getElementById("clustersCheckbox").checked == true){
    $.ajax({
      url: "/static/data/centroids/nesp2_state_all_clusters_centroids_" + title_to_snake(centroids_file_key) + ".geojson",
      dataType: "json",
      success: function(data) {
        // handleData allows this function to be called in another function
        handleData(data);
      },
      error: function (xhr) {
        console.log(xhr.statusText);
        console.log("loading of geojson failed");
      }
    })
  }
}

// Function takes the data from update_centroids_data. Due to the asynchronous call they cannot simply be stored in a variable
function update_centroids(){
  update_centroids_data(function(output){
    centroids = output;
    // Creates a geojson-layer with the data
    var centroids_layer = L.geoJSON(centroids, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            interactive: false,
            radius: 0,
            weight: 5,
            opacity: 0,
            fillOpacity: 0,
        });
    }
  });
  // add geojson-layer to a group
  centroids_layer.addTo(centroidsGroup);
  // store the _leaflet_id of the centroids layer in a variable. The layer can be called with this id.
  centroids_layer_id = centroids_layer._leaflet_id;
  });
}

// initial call of this function upon map start is necessary
update_centroids();

// function removes previous centroid layer
function update_centroids_group(){
  //TODO remove old layers to avoid very large cache. need to check if layer exists, else map becomes unresponsive.
  if (centroids_layer_id in centroidsGroup._layers){
    centroidsGroup.removeLayer(centroids_layer_id);
  }
  else {
  console.log("Not removing absent Layer");
  }
  update_centroids();
}

// End of functions for asynchronous call

// functions takes in centroid from cluster-centroid-layer and returns its bounds from properties
function get_bbox_from_cluster_centroid(centroid){
  var north = centroid.feature.properties.bb_north;
  var east = centroid.feature.properties.bb_east;
  var south = centroid.feature.properties.bb_south;
  var west = centroid.feature.properties.bb_west;
  var bbox = [[south,west],[north,east]]
  return(bbox);
}


function set_current_cluster_centroids(){
  current_cluster_centroids = centroidsGroup._layers;
}

function get_current_centroids_from_layer(){
  centroids = current_cluster_centroids[centroids_layer_id]._layers;
  return(centroids);
}

function get_centroid_by_id(centroid_id){
  centroid = current_cluster_centroids[centroids_layer_id]._layers[centroid_id];
  return(centroid);
}

function get_centroid_info(centroid){
  info = centroid.feature.properties;
  return(info);
}

//function updates the list of cluster keys in filtered_centroids_keys
function filter_centroid_keys(){
  filtered_centroids_keys = [];
  centroids = get_current_centroids_from_layer();
  const keys = Object.keys(centroids);
  // interates though cluster centroids and pushes keys of clusters that fal within filter settings
  console.log("FILTERING STUFF NOW!!!!!!!!!");
  for (const key of keys) {
      //if activated clusters are off-grid-clusters
    if (centroids[key].feature.properties.hasOwnProperty('percentage_building_area')){
      if (
        centroids[key].feature.properties.area_km2 > currentfilter.ogminarea && 
        centroids[key].feature.properties.area_km2 < currentfilter.ogmaxarea &&
        centroids[key].feature.properties.grid_dist_km > currentfilter.ogmindtg && 
        centroids[key].feature.properties.grid_dist_km < currentfilter.ogmaxdtg && 
        centroids[key].feature.properties.building_count > currentfilter.ogminb && 
        centroids[key].feature.properties.building_count < currentfilter.ogmaxb &&
        centroids[key].feature.properties.percentage_building_area > currentfilter.ogminbfp && 
        centroids[key].feature.properties.percentage_building_area < currentfilter.ogmaxbfp
      ){
        filtered_centroids_keys.push(key);
      }
    }
    else if (centroids[key].feature.properties.hasOwnProperty('cluster_all_id')){
      console.log("CLUSTERS 4 ALLLLLLLLLL");
      if (
        centroids[key].feature.properties.area_km2 > currentfilter.minarea && 
        centroids[key].feature.properties.area_km2 < currentfilter.maxarea &&
        centroids[key].feature.properties.grid_dist_km > currentfilter.mindtg && 
        centroids[key].feature.properties.grid_dist_km < currentfilter.maxdtg
      ){
        filtered_centroids_keys.push(key);
      }
    }
  }
  //console.log("filtered keys list:");
  //console.log(filtered_centroids_keys);
}

function update_cluster_info(){
      var centroid = get_centroid_by_id(currently_featured_centroid_id);
      var centroid_info = get_centroid_info(centroid);

    const clusterNum = filtered_centroids_keys.indexOf(currently_featured_centroid_id) + 1;
    const selectedClustersNum = filtered_centroids_keys.length;
    update_clusterInfo(centroid_info, selectedClustersNum, clusterNum);

}

// flyTo-function including a with reset of 'flying_to_next_cluster' to false in order to allow level change via manual zoom afterwards
function flyToClusterBounds(target){
  flying_to_next_cluster = true;
  map.flyToBounds(target);
    map.once('moveend', function() {
      flying_to_next_cluster = false;
    });
}

function next_selection_fun(){
  set_current_cluster_centroids();
  var centroid = Object();
  var target = [[0,0][0,0]];
  filter_centroid_keys();
  // select next cluster and to zoom to its bounds
  // if currently no centroid has been selected, set the selection to the first cluster and fly there
  if(filtered_centroids_keys.indexOf(currently_featured_centroid_id) == -1){
    currently_featured_centroid_id = filtered_centroids_keys[0];
    centroid = get_centroid_by_id(currently_featured_centroid_id);
    target = get_bbox_from_cluster_centroid(centroid);
    flyToClusterBounds(target);
  }
  // else if the selected centroid is the last one, keep it selected
  else if (filtered_centroids_keys.indexOf(currently_featured_centroid_id) == filtered_centroids_keys.length -1){
    console.log("last element")
  }
  // else set the selected centroid to be the next one via index
  else{
    currently_featured_centroid_id = filtered_centroids_keys[filtered_centroids_keys.indexOf(currently_featured_centroid_id) + 1 ];
    centroid = (current_cluster_centroids[centroids_layer_id]._layers[currently_featured_centroid_id]);
    target = get_bbox_from_cluster_centroid(centroid);
    flying_to_next_cluster = true;
    flyToClusterBounds(target);
  }
  update_cluster_info();
}

function prev_selection_fun(){
  set_current_cluster_centroids();
  var centroid = Object();
  var target = [[0,0][0,0]];
  filter_centroid_keys();
  // if currently no centroid has been selected, set the selection to the first cluster
  if(filtered_centroids_keys.indexOf(currently_featured_centroid_id) == -1){
    currently_featured_centroid_id = filtered_centroids_keys[0];
    centroid = get_centroid_by_id(currently_featured_centroid_id);
    target = get_bbox_from_cluster_centroid(centroid);
    flyToClusterBounds(target);
  }
  // else if the selected centroid is the first one, keep it selected
  else if (filtered_centroids_keys.indexOf(currently_featured_centroid_id) == 0){
    currently_featured_centroid_id = filtered_centroids_keys[0];
    //console.log("first element")
  }
  // else set the selected centroid to be the previous one via index
  else{currently_featured_centroid_id = filtered_centroids_keys[filtered_centroids_keys.indexOf(currently_featured_centroid_id) - 1 ]; 
    // select the next centroid and fly to its bounds
    centroid = get_centroid_by_id(currently_featured_centroid_id);
    target = get_bbox_from_cluster_centroid(centroid);
    flyToClusterBounds(target);
  }
  update_cluster_info();
}

function lga_cb_fun() {
  /*var checkBox = document.getElementById("lgaCheckbox");
  if (checkBox.checked == true){
    add_layer(lgas_pbf)
  }
  else {
    remove_layer(lgas_pbf)
  }
  */
}
