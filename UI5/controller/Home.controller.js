sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, Fragment) {
    "use strict";

    return Controller.extend("zfc.finux.zfcvimgr.controller.Home", {

        onInit: function () {
            var oAppViewModel = this.getOwnerComponent().getModel("appView");
            if (!oAppViewModel.getProperty("/vimDocId")) {
                oAppViewModel.setProperty("/vimDocId", "");
            }
        },

        onOpenDocument: function () {
            var sDocId = this.getOwnerComponent().getModel("appView").getProperty("/vimDocId");

            if (!sDocId || sDocId.trim() === "") {
                MessageToast.show(this._getText("msgNoDocIdProvided"));
                return;
            }

            sDocId = sDocId.trim();
            if (/^\d+$/.test(sDocId) && sDocId.length < 10) {
                sDocId = sDocId.padStart(10, "0");
            }

            this.getOwnerComponent().getRouter().navTo("detail", {
                VimDocumentId: encodeURIComponent(sDocId)
            });
        },

        /* ============================================================ */
        /*  Value Help Dialog                                           */
        /* ============================================================ */

        onValueHelpRequest: function () {
            var that = this;

            if (!this._oValueHelpDialog) {
                var oColModel = new JSONModel({
                    cols: [
                        { label: this._getText("vhByDocId"), template: "VimDocumentId" },
                        { label: this._getText("vhByPO"), template: "PurchaseOrder" },
                        { label: this._getText("vhByVendor"), template: "Vendor" },
                        { label: this._getText("vendorName"), template: "VendorName", width: "16rem" },
                        { label: this._getText("processStatus"), template: "ProcessStatusText" },
                        { label: this._getText("grossAmount"), template: "GrossAmount" }
                    ]
                });

                Fragment.load({
                    id: this.getView().getId(),
                    name: "zfc.finux.zfcvimgr.view.fragment.VimDocValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    that._oValueHelpDialog = oDialog;
                    that.getView().addDependent(oDialog);

                    oDialog.getTableAsync().then(function (oTable) {
                        oTable.setModel(oColModel, "columns");
                        oTable.setBusyIndicatorDelay(1);
                        oTable.setEnableBusyIndicator(true);
                    });

                    // Hide the 'Show Advanced Search' toggle
                    var oFilterBar = oDialog.getFilterBar();
                    if (oFilterBar._oHideShowButton) {
                        oFilterBar._oHideShowButton.setVisible(false);
                    }

                    oDialog.open();
                });
            } else {
                this._oValueHelpDialog.setTokens([]);
                this._oValueHelpDialog.open();
            }
        },

        onVHFilterBarSearch: function (oEvent) {
            var aSelectionSet = oEvent.getParameter("selectionSet");

            // If triggered from Input submit (Enter key), get controls from FilterBar
            if (!aSelectionSet) {
                var oFilterBar = this.byId("vhFilterBar");
                if (oFilterBar) {
                    oFilterBar.search();
                    return;
                }
            }

            var aFilters = [];

            aSelectionSet.forEach(function (oControl) {
                var sValue = oControl.getValue().trim();
                if (sValue) {
                    aFilters.push(
                        new Filter(oControl.getName(), FilterOperator.EQ, sValue)
                    );
                }
            });

            if (aFilters.length === 0) {
                MessageBox.information(this._getText("vhEnterSearch"));
                return;
            }

            var oFilter = new Filter({ filters: aFilters, and: true });
            var that = this;
            var oDataModel = this.getOwnerComponent().getModel();

            var oListBinding = oDataModel.bindList(
                "/VIMDocumentVH", undefined, undefined,
                [oFilter],
                {
                    $select: "VimDocumentId,PurchaseOrder,Vendor," +
                        "VendorName,GrossAmount,Currency," +
                        "ProcessStatus,ProcessStatusText"
                }
            );

            this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setBusy(true);
            });

            oListBinding.requestContexts(0, 50).then(function (aContexts) {
                var aResults = aContexts.map(function (oCtx) {
                    return oCtx.getObject();
                });

                that._oValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setModel(new JSONModel(aResults));
                    if (oTable.bindRows) {
                        oTable.bindRows("/");
                    } else if (oTable.bindItems) {
                        oTable.bindItems({
                            path: "/",
                            template: oTable.getBindingInfo("items")
                                ? oTable.getBindingInfo("items").template
                                : null
                        });
                    }
                    oTable.setBusy(false);
                });

                if (aResults.length === 0) {
                    MessageToast.show(that._getText("vhNoResults"));
                }
            }).catch(function () {
                that._oValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setBusy(false);
                });
                MessageToast.show(that._getText("vhSearchError"));
            });
        },

        onVHOkPress: function (oEvent) {
            var aTokens = oEvent.getParameter("tokens");
            if (aTokens && aTokens.length > 0) {
                var sDocId = aTokens[0].getKey();
                this.getOwnerComponent().getModel("appView").setProperty("/vimDocId", sDocId);
                this._oValueHelpDialog.close();

                this.getOwnerComponent().getRouter().navTo("detail", {
                    VimDocumentId: encodeURIComponent(sDocId)
                });
            }
        },

        onVHCancelPress: function () {
            this._oValueHelpDialog.close();
        },

        onVHAfterClose: function () {
            // Clean up if needed
        },

        /* ============================================================ */
        /*  Helpers                                                     */
        /* ============================================================ */

        _getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n")
                .getResourceBundle().getText(sKey, aArgs);
        }
    });
});