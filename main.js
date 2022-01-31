(function () {
  $(function () {
    let coinsArray = [];
    let selectedCoins = [];

    function loadCoinsData() {
      $(".mainLoader").show();
      $.get("https://api.coingecko.com/api/v3/coins/list")
        .then((coins) => {
          $(".mainLoader").hide();
          let coinsTempArray = [];
          for (let i = 0; i < 100; i++) {
            coinsTempArray.push(coins[i]);
          }
          coinsArray = coinsTempArray;
          showCoins();
        })
        .catch((error) => {
          $(".mainLoader").hide();
          console.log(error);
          alert("There has been a problem extracting data from the server");
        });
    }

    loadCoinsData();

    function checkValidation() {
      if ($("#searchInput").val() == "") {
        alert("Please Enter coin name");
      }
    }

    /*Search Button */

    $("#searchForm").on("submit", (e) => {
      e.preventDefault();
      findCoinCardBySearchButton();
    });

    function findCoinCardBySearchButton() {
      $("#container").show();
      $("#liveReports").hide();
      $("#showAbout").hide();

      $("#container .row").html("");
      checkValidation();
      let nameValue = $("#searchInput").val().toLowerCase();
      let found = [];
      for (let i = 0; i < coinsArray.length; i++) {
        if (coinsArray[i].symbol.indexOf(nameValue) > -1) {
          found.push(coinsArray[i]);
          addCoinsCardUI(coinsArray[i]);
        }
      }
      addEventToCollapse();
      addEventToSwitch();

      if (!found.length) {
        $("#container .row").html(
          `<p id="showErrorMessage">Coin with this name doesn't exist</p>`
        );
      }
      let cardToggles = $(".cardSwitch");
      for (let i = 0; i < cardToggles.length; i++) {
        if (selectedCoins.includes(cardToggles[i].id)) {
          cardToggles[i].checked = true;
        }
      }
    }

    function showCoins() {
      $("#container .row").html("");
      for (let i = 0; i < coinsArray.length; i++) {
        addCoinsCardUI(coinsArray[i]);
      }
      addEventToCollapse();
      addEventToSwitch();
      let cardToggles = $(".cardSwitch");
      for (let i = 0; i < cardToggles.length; i++) {
        if (selectedCoins.includes(cardToggles[i].id)) {
          cardToggles[i].checked = true;
        }
      }
    }

    let coinCard;

    function showMoreInfo(e) {
      let activeBtn = e[0];
      let activeBtnId = e[0].id;
      coinCard = $(`#cardBody${activeBtnId}`);
      let localData = localStorage.getItem(activeBtnId);
      if (activeBtn.ariaExpanded === "false") {
        if (!localData) {
          //call to the server
          $(".loader").show();
          $.get(`https://api.coingecko.com/api/v3/coins/${activeBtnId}`).then(
            (coin) => {
              localStorage.setItem(activeBtnId, JSON.stringify(coin));
              setTimeout(() => {
                localStorage.removeItem(activeBtnId);
              }, 120000);
              $(".loader").hide();
              // function
              showMoreButtonInfo(coin);
            }
          );
        } else {
          localData = JSON.parse(localData);
          showMoreButtonInfo(localData);
        }
      }
    }

    function showMoreButtonInfo(coin) {
      coinCard.html(
        `<div class="prices text-center">
          <div class="row">
              <div class="col-3">
                  <img src="${coin.image.small}"><br>
              </div>
              <div class="col-9">
                  <span>ILs: ${coin.market_data.current_price.ils}</span><br>
                  <span>USD: ${coin.market_data.current_price.usd}</span><br>
                  <span>EUR: ${coin.market_data.current_price.eur}</span>
              </div>
          </div>
      </div`
      );
    }

    function addEventToCollapse() {
      let collapse = $(".moreBtnToggle");
      for (let i = 0; i < collapse.length; i++) {
        $(`#${collapse[i].id}`).on("click", () =>
          showMoreInfo($(`#${collapse[i].id}`))
        );
      }
    }

    function addEventToSwitch() {
      let toggle = $(".switchToggle");
      for (let i = 0; i < toggle.length; i++) {
        $(`#${toggle[i].children[0].id}`).on("click", selectCoins);
      }
    }

    function addCoinsCardUI(coin) {
      let coinCard = `<div class="col-md-4">
                    <div class="card">
                    <div class="card-body">

                        <div class="coinHeader">

                          <h5 class="card-title">${coin.symbol}</h5>
                          
                          <div class="custom-control custom-switch switchToggle switchStyle">
                              <input type="checkbox" 
                              class="custom-control-input cardSwitch" id="${
                                coin.symbol
                              }">
                              <label class="custom-control-label switchLabel" for="${
                                coin.symbol
                              }"></label>
                          </div>
                        
                        </div>
                        <p class="card-text">${coin.name}</p>
                        <button 
                        id=${coin.id === "" ? Math.random() * 10 : coin.id}
                        class="btn btn-primary moreBtnToggle" 
                        type="button" data-toggle="collapse" 
                        data-target="#collapseExample${coin.id}" 
                        aria-expanded="false" 
                        aria-controls="collapseExample">
                            Show more
                        </button>
                        </p>
                        <div class="collapse" id="collapseExample${coin.id}">
                        <div class="card card-body" id="cardBody${coin.id}">
                        <div class="spinner-border loader" style="width: 3rem; height: 3rem;" role="status">
                        <span class="sr-only">Loading...</span>
                      </div>   
                        </div>
                        </div>
                    </div>
                    </div>
              </div>`;
      $("#container .row").append(coinCard);
    }

    function selectCoins(e) {
      let selectedCheckBox = e.target;
      if (selectedCheckBox.checked) {
        if (selectedCoins.length < 5) {
          // push to selected items array
          selectedCoins.push(selectedCheckBox.id);
        } else {
          // open modal
          selectedCheckBox.checked = false;
          createModal();
          $(".modal-body").html('<div id="listDiv"></div>');
          let selectedList = $("#listDiv");
          selectedCoins.forEach((coin) =>
            selectedList.append(`
            <div id="listItem">
              <p>${coin}</p>
              <div class="custom-control custom-switch innerToggle">
                <input type="checkbox" class="custom-control-input modalSwitch" id="toggle${coin}"  >
                <label class="custom-control-label" for="toggle${coin}"></label>
              </div>
            </div>
           `)
          );
          let innerToggleBtns = $(".modalSwitch");
          for (let i = 0; i < innerToggleBtns.length; i++) {
            innerToggleBtns[i].checked = true;
            $(`#${innerToggleBtns[i].id}`).on("click", uncheckCoin);
          }
          function uncheckCoin(e) {
            if (!e.target.checked) {
              let id = e.target.id.slice(6);
              let unCheckedIndex = selectedCoins.indexOf(id);
              selectedCoins.splice(unCheckedIndex, 1);
              $("#coinsModal").modal("hide");

              const checkedinp = $(".cardSwitch:checked");
              for (let e = 0; e < checkedinp.length; e++) {
                if (id == checkedinp[e].id) {
                  checkedinp[e].checked = false;
                }
              }
            }
          }
        }
      } else {
        //slice id from selectedItems
        let unCheckedIndex = selectedCoins.indexOf(selectedCheckBox.id);
        selectedCoins.splice(unCheckedIndex, 1);
      }
    }

    function createModal() {
      $("body").append(`
          <div class="modal fade" id="coinsModal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="coinsModalLabel">Coins Modal Table</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                 
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary">Save changes</button>
                </div>
              </div>
            </div>
          </div>`);
      $("#coinsModal").modal("show");
    }

    let chartContainer = {
      exportEnabled: true,
      animationEnabled: true,
      title: {
        text: "",
      },
      subtitles: [
        {
          text: "",
        },
      ],
      axisY: {
        title: "Coin Value",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
      },
      data: [],
    };

    function toggleDataSeries(e) {
      if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      e.chart.render();
    }

    let callToServer;
    let coinQueryStr = "";

    function getChartData() {
      selectedCoins.forEach((coin) => {
        coinQueryStr += `${coin},`;
      });

      // clear canvas
      $("#chartContainer").html("");

      // loader
      if (coinQueryStr !== "") {
        $("#chartContainer").append(`
      <div class="spinner-border chartLoader loader" style="width: 4rem; height: 4rem;" role="status">
        <span class="sr-only">Loading...</span>
      </div>  
    `);
        callToServer = setInterval(
          () =>
            $.get(
              `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinQueryStr}&tsyms=USD`
            )
              .then((data) => {
                $(".chartLoader").hide();
                let formatedTitle = coinQueryStr.slice(0, -1);
                chartContainer.title.text = `${formatedTitle} to USD`;
                chartContainer.subtitles[0].text =
                  "Click Legend to Hide or Unhide Data Series";
                for (const [key, value] of Object.entries(data)) {
                  if (
                    chartContainer.data.map((item) => item.name).includes(key)
                  ) {
                    let existingItem = chartContainer.data.findIndex(
                      (item) => item.name === key
                    );
                    let newDataPointObj = { x: new Date(), y: value.USD };
                    chartContainer.data[existingItem].dataPoints.push(
                      newDataPointObj
                    );
                  } else {
                    let newChartCoin = {
                      type: "spline",
                      name: key,
                      showInLegend: true,
                      xValueFormatString: "h:mm",
                      yValueFormatString: "#,##0 Units",
                      dataPoints: [],
                    };
                    let newDataPointObj = { x: new Date(), y: value.USD };
                    newChartCoin.dataPoints.push(newDataPointObj);
                    chartContainer.data.push(newChartCoin);
                  }
                  $("#chartContainer").CanvasJSChart(chartContainer);
                }
              })
              .catch((error) => {
                console.log(error);
                alert(
                  "There has been a problem extracting data from the server"
                );
              }),
          2000
        );
      } else {
        chartContainer.subtitles[0].text = "";
        chartContainer.title.text = "No Coins Chosen";
        $("#chartContainer").CanvasJSChart(chartContainer);
      }
      setInterval(() => (chartContainer.data.length = 0), 20000);
    }

    function resetChart() {
      chartContainer.data.length = 0;
      chartContainer.title.text = "";
      coinQueryStr = "";
    }

    let links = document.querySelectorAll(".link");
    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        let id = e.target.id;

        if (id == "1") {
          $("#container").show();
          showCoins();
          $("#liveReports").hide();
          $("#showAbout").hide();
          resetChart();
          clearInterval(callToServer);
        } else if (id == "2") {
          $("#container").hide();
          $("#liveReports").show();
          $("#showAbout").hide();
          resetChart();
          getChartData();
        } else {
          $("#container").hide();
          $("#liveReports").hide();
          $("#showAbout").show().css("display", "flex");
          resetChart();
          clearInterval(callToServer);
        }
      });
    });
  });
})();
