sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/SearchField",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/SegmentedButton",
    "sap/m/SegmentedButtonItem",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Title",
    "sap/m/BusyIndicator"
], function (Controller, MessageToast, JSONModel, Filter, FilterOperator,
             Dialog, List, StandardListItem, SearchField, Bar, Button,
             VBox, SegmentedButton, SegmentedButtonItem, Toolbar, ToolbarSpacer,
             Title, BusyIndicator) {
    "use strict";

    return Controller.extend("zfc.finux.zfcvimgr.controller.Home", {

        onInit: function () {
            var oAppViewModel = this.getOwnerComponent().getModel("appView");
            if (!oAppViewModel.getProperty("/vimDocId")) {
                oAppViewModel.setProperty("/vimDocId", "");
            }
        },

        /**
         * Navigate to the detail page for the entered VIM Document ID.
         */
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

        /**
         * Open the value help dialog for searching VIM documents.
         */
        onValueHelpRequest: function () {
            var that = this;

            if (!this._oValueHelpDialog) {
                // Results model
                this._oVHModel = new JSONModel({
                    results: [],
                    busy: false,
                    searchBy: "VimDocumentId"
                });

                // Search field
                this._oVHSearchField = new SearchField({
                    placeholder: this._getText("vhSearchPlaceholder"),
                    search: function () { that._onVHSearch(); },
                    width: "100%"
                });

                // Search-by toggle
                this._oVHSegmented = new SegmentedButton({
                    selectedKey: "VimDocumentId",
                    selectionChange: function (oEvent) {
                        that._oVHModel.setProperty("/searchBy", oEvent.getParameter("item").getKey());
                        that._oVHSearchField.setPlaceholder(that._getVHPlaceholder(oEvent.getParameter("item").getKey()));
                    },
                    items: [
                        new SegmentedButtonItem({ text: this._getText("vhByDocId"), key: "VimDocumentId" }),
                        new SegmentedButtonItem({ text: this._getText("vhByPO"), key: "PurchaseOrder" }),
                        new SegmentedButtonItem({ text: this._getText("vhByVendor"), key: "Vendor" })
                    ]
                });

                // Results list
                this._oVHList = new List({
                    noDataText: this._getText("vhNoResults"),
                    mode: "SingleSelectMaster",
                    selectionChange: function (oEvent) {
                        that._onVHSelect(oEvent);
                    },
                    items: {
                        path: "vhModel>/results",
                        template: new StandardListItem({
                            title: "{vhModel>VimDocumentId}",
                            description: "{vhModel>VendorName}",
                            info: "PO: {vhModel>PurchaseOrder}",
                            infoState: "None"
                        })
                    }
                });
                this._oVHList.setModel(this._oVHModel, "vhModel");

                this._oValueHelpDialog = new Dialog({
                    title: this._getText("vhTitle"),
                    contentWidth: "36rem",
                    contentHeight: "24rem",
                    stretch: sap.ui.Device.system.phone,
                    subHeader: new Toolbar({
                        content: [
                            this._oVHSegmented
                        ]
                    }),
                    content: [
                        new VBox({
                            items: [
                                this._oVHSearchField,
                                this._oVHList
                            ]
                        }).addStyleClass("sapUiSmallMargin")
                    ],
                    beginButton: new Button({
                        text: this._getText("cancelButton"),
                        press: function () {
                            that._oValueHelpDialog.close();
                        }
                    })
                });

                this.getView().addDependent(this._oValueHelpDialog);
            }

            // Reset
            this._oVHModel.setProperty("/results", []);
            this._oVHSearchField.setValue("");
            this._oValueHelpDialog.open();
        },

        /**
         * Execute search in value help dialog.
         */
        _onVHSearch: function () {
            var sQuery = this._oVHSearchField.getValue().trim();
            if (!sQuery) {
                MessageToast.show(this._getText("vhEnterSearch"));
                return;
            }

            var sField = this._oVHModel.getProperty("/searchBy");
            var that = this;

            // Pad VIM doc IDs with leading zeros
            if (sField === "VimDocumentId" && /^\d+$/.test(sQuery) && sQuery.length < 10) {
                sQuery = sQuery.padStart(10, "0");
            }

            this._oVHModel.setProperty("/busy", true);
            this._oVHList.setBusy(true);

            var oDataModel = this.getOwnerComponent().getModel();
            var oListBinding = oDataModel.bindList("/VIMDocument", undefined, undefined, [
                new Filter(sField, FilterOperator.Contains, sQuery)
            ], {
                $select: "VimDocumentId,PurchaseOrder,Vendor,VendorName,GrossAmount,Currency,ProcessStatus",
                $top: 50
            });

            oListBinding.requestContexts(0, 50).then(function (aContexts) {
                var aResults = aContexts.map(function (oCtx) {
                    return oCtx.getObject();
                });
                that._oVHModel.setProperty("/results", aResults);
                that._oVHList.setBusy(false);
                that._oVHModel.setProperty("/busy", false);

                if (aResults.length === 0) {
                    MessageToast.show(that._getText("vhNoResults"));
                }
            }).catch(function () {
                that._oVHList.setBusy(false);
                that._oVHModel.setProperty("/busy", false);
                MessageToast.show(that._getText("vhSearchError"));
            });
        },

        /**
         * Handle value help selection — set the doc ID and close.
         */
        _onVHSelect: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oCtx = oItem.getBindingContext("vhModel");
            var sDocId = oCtx.getProperty("VimDocumentId");

            this.getOwnerComponent().getModel("appView").setProperty("/vimDocId", sDocId);
            this._oValueHelpDialog.close();

            // Navigate directly
            this.getOwnerComponent().getRouter().navTo("detail", {
                VimDocumentId: encodeURIComponent(sDocId)
            });
        },

        /**
         * Get placeholder text for the search field based on selected filter.
         */
        _getVHPlaceholder: function (sKey) {
            switch (sKey) {
                case "PurchaseOrder": return this._getText("vhPlaceholderPO");
                case "Vendor": return this._getText("vhPlaceholderVendor");
                default: return this._getText("vhPlaceholderDocId");
            }
        },

        /**
         * Helper to get i18n text.
         */
        _getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n")
                .getResourceBundle().getText(sKey, aArgs);
        }
    });
});
