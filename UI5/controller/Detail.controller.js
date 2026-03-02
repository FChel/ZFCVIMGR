sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/BusyIndicator",
    "zfc/finux/zfcvimgr/model/formatter"
], function (Controller, JSONModel, MessageBox, MessageToast, Fragment, BusyIndicator, formatter) {
    "use strict";

    var BALANCE_TOLERANCE = 0.01;

    return Controller.extend("zfc.finux.zfcvimgr.controller.Detail", {

        formatter: formatter,

        /* ============================================================ */
        /*  Lifecycle                                                    */
        /* ============================================================ */

        onInit: function () {
            var oDetailModel = new JSONModel({
                busy: true,
                VimDocumentId: "",
                PurchaseOrder: "",
                Vendor: "",
                VendorName: "",
                InvoiceNumber: "",
                ProcessStatus: "",
                ProcessStatusFormatted: "",
                StatusIcon: "",
                StatusCriticality: 0,
                NetAmount: 0,
                TaxAmount: 0,
                GrossAmount: 0,
                Currency: "",
                ReceivedDate: null,
                ReceivedDateFormatted: "",
                PaymentTerms: "",
                PaymentTermsText: "",
                DueDate: null,
                IsDueDatePassed: "",
                CreditMemo: "",
                CompanyCode: "",
                FiscalYear: "",
                AccountingDocument: "",
                PostingDate: null,
                DocumentDate: null,
                CurrentProcessType: "",
                GoodsReceipts: [],
                POItems: [],
                VimItems: [],
                GoodsReceiptsCount: "0",
                POItemsCount: "0",
                VimItemsCount: "0",
                SelectedGRCount: 0,
                TotalGRCount: 0,
                SelectionInfo: "",
                Balance: {
                    NetAmount: 0,
                    TaxAmount: 0,
                    GrossAmount: 0,
                    Remaining: 0,
                    IsBalanced: false
                },
                RejectReason: ""
            });
            this.getView().setModel(oDetailModel, "detail");

            this.getOwnerComponent().getRouter()
                .getRoute("detail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        /* ============================================================ */
        /*  Route Handling                                               */
        /* ============================================================ */

        _onRouteMatched: function (oEvent) {
            var sVimDocumentId = decodeURIComponent(
                oEvent.getParameter("arguments").VimDocumentId
            );
            this._sVimDocumentId = sVimDocumentId;
            this._loadDocument(sVimDocumentId);
        },

        _loadDocument: function (sVimDocumentId) {
            var oDetailModel = this.getView().getModel("detail");
            oDetailModel.setProperty("/busy", true);

            var oDataModel = this.getOwnerComponent().getModel();
            var sPath = "/VIMDocument('" + sVimDocumentId + "')";
            var oContext = oDataModel.bindContext(
                sPath,
                undefined,
                {
                    $expand: "_Items,_GoodsReceipts,_POItems"
                }
            );

            oContext.requestObject().then(function (oData) {
                if (!oData) {
                    this._handleDocumentNotFound();
                    return;
                }

                // Set header data
                oDetailModel.setProperty("/VimDocumentId", oData.VimDocumentId);
                oDetailModel.setProperty("/PurchaseOrder", oData.PurchaseOrder);
                oDetailModel.setProperty("/Vendor", oData.Vendor);
                oDetailModel.setProperty("/VendorName", oData.VendorName);
                oDetailModel.setProperty("/InvoiceNumber", oData.InvoiceNumber);
                oDetailModel.setProperty("/ProcessStatus", oData.ProcessStatus);
                oDetailModel.setProperty("/ProcessStatusFormatted", this._formatStatus(oData.ProcessStatus));
                oDetailModel.setProperty("/StatusIcon", this._getStatusIcon(oData.StatusCriticality));
                oDetailModel.setProperty("/StatusCriticality", oData.StatusCriticality);
                oDetailModel.setProperty("/NetAmount", parseFloat(oData.NetAmount) || 0);
                oDetailModel.setProperty("/TaxAmount", parseFloat(oData.TaxAmount) || 0);
                oDetailModel.setProperty("/GrossAmount", parseFloat(oData.GrossAmount) || 0);
                oDetailModel.setProperty("/Currency", oData.Currency);
                oDetailModel.setProperty("/ReceivedDate", oData.ReceivedDate);
                oDetailModel.setProperty("/ReceivedDateFormatted", this._formatDate(oData.ReceivedDate));
                oDetailModel.setProperty("/PaymentTerms", oData.PaymentTerms);
                oDetailModel.setProperty("/PaymentTermsText", oData.PaymentTermsText);
                oDetailModel.setProperty("/DueDate", oData.DueDate);
                oDetailModel.setProperty("/IsDueDatePassed", oData.IsDueDatePassed);
                oDetailModel.setProperty("/CreditMemo", oData.CreditMemo);
                oDetailModel.setProperty("/CompanyCode", oData.CompanyCode);
                oDetailModel.setProperty("/FiscalYear", oData.FiscalYear);
                oDetailModel.setProperty("/AccountingDocument", oData.AccountingDocument);
                oDetailModel.setProperty("/PostingDate", oData.PostingDate);
                oDetailModel.setProperty("/DocumentDate", oData.DocumentDate);
                oDetailModel.setProperty("/CurrentProcessType", oData.CurrentProcessType);

                // Set child data with pre-formatted dates
                var aGRs = oData._GoodsReceipts || [];
                var that = this;
                aGRs.forEach(function (oGR) {
                    oGR.EntryDateFormatted = that._formatDate(oGR.EntryDate);
                    oGR.PostingDateFormatted = that._formatDate(oGR.PostingDate);
                });
                var aPOs = oData._POItems || [];
                var aItems = oData._Items || [];
                oDetailModel.setProperty("/GoodsReceipts", aGRs);
                oDetailModel.setProperty("/POItems", aPOs);
                oDetailModel.setProperty("/VimItems", aItems);
                oDetailModel.setProperty("/GoodsReceiptsCount", String(aGRs.length));
                oDetailModel.setProperty("/POItemsCount", String(aPOs.length));
                oDetailModel.setProperty("/VimItemsCount", String(aItems.length));
                oDetailModel.setProperty("/TotalGRCount", aGRs.length);

                // Update FLP shell title based on document type
                this._updateShellTitle(oData.CreditMemo === "X");

                // Auto-select GRs then calculate balance
                oDetailModel.setProperty("/busy", false);

                // Defer auto-select to next tick so table is rendered
                setTimeout(function () {
                    that._autoSelectGRs(aGRs);
                }, 0);

            }.bind(this)).catch(function () {
                oDetailModel.setProperty("/busy", false);
                this._handleDocumentNotFound();
            }.bind(this));
        },

        _handleDocumentNotFound: function () {
            MessageBox.error(this._getText("msgDocumentNotFound"), {
                onClose: function () {
                    this.onNavBack();
                }.bind(this)
            });
        },

        /* ============================================================ */
        /*  Auto-Select Logic                                            */
        /* ============================================================ */

        /**
         * Automatically select GR lines when the data loads:
         *  1. If only one GR line exists, select it.
         *  2. If selecting ALL GRs produces a balanced result, select all.
         * This saves the user manual ticking for straightforward cases.
         */
        _autoSelectGRs: function (aGRs) {
            if (!aGRs || aGRs.length === 0) {
                this._calculateBalance();
                return;
            }

            var oDetailModel = this.getView().getModel("detail");
            var sCreditMemo = oDetailModel.getProperty("/CreditMemo");

            // Do not auto-select for credit memos (mode is None)
            if (sCreditMemo === "X") {
                this._calculateBalance();
                return;
            }

            var oGRTable = this.byId("goodsReceiptsTable");
            if (!oGRTable) {
                this._calculateBalance();
                return;
            }

            var fInvoiceGross = oDetailModel.getProperty("/GrossAmount") || 0;
            var fInvoiceNet = oDetailModel.getProperty("/NetAmount") || 0;
            var fInvoiceTax = oDetailModel.getProperty("/TaxAmount") || 0;

            // Calculate what the total would be if all GRs were selected
            var fAllNet = 0;
            aGRs.forEach(function (oGR) {
                fAllNet += parseFloat(oGR.Amount) || 0;
            });
            var fTaxRatio = fInvoiceNet > 0 ? (fInvoiceTax / fInvoiceNet) : 0;
            var fAllGross = fAllNet + (fAllNet * fTaxRatio);
            var bAllBalance = Math.abs(fInvoiceGross - fAllGross) <= BALANCE_TOLERANCE;

            if (aGRs.length === 1 || bAllBalance) {
                // Select all items in the table
                oGRTable.selectAll();
            }

            this._calculateBalance();
        },

        /* ============================================================ */
        /*  Balance Calculation                                          */
        /* ============================================================ */

        _calculateBalance: function () {
            var oDetailModel = this.getView().getModel("detail");
            var oGRTable = this.byId("goodsReceiptsTable");
            var fInvoiceGross = oDetailModel.getProperty("/GrossAmount") || 0;
            var fInvoiceNet = oDetailModel.getProperty("/NetAmount") || 0;
            var fInvoiceTax = oDetailModel.getProperty("/TaxAmount") || 0;

            var fSelectedNet = 0;
            var fSelectedTax = 0;
            var fSelectedGross = 0;
            var iSelectedCount = 0;

            if (oGRTable) {
                var aSelectedItems = oGRTable.getSelectedItems();
                iSelectedCount = aSelectedItems.length;
                aSelectedItems.forEach(function (oItem) {
                    var oCtx = oItem.getBindingContext("detail");
                    if (oCtx) {
                        fSelectedNet += parseFloat(oCtx.getProperty("Amount")) || 0;
                    }
                });

                if (fInvoiceNet > 0) {
                    var fTaxRatio = fInvoiceTax / fInvoiceNet;
                    fSelectedTax = fSelectedNet * fTaxRatio;
                }
                fSelectedGross = fSelectedNet + fSelectedTax;
            }

            var fRemaining = fInvoiceGross - fSelectedGross;
            var bIsBalanced = Math.abs(fRemaining) <= BALANCE_TOLERANCE;

            // Update selection count info
            var iTotalGR = oDetailModel.getProperty("/TotalGRCount") || 0;
            oDetailModel.setProperty("/SelectedGRCount", iSelectedCount);
            oDetailModel.setProperty("/SelectionInfo",
                iSelectedCount + " of " + iTotalGR + " selected");

            oDetailModel.setProperty("/Balance", {
                NetAmount: fSelectedNet,
                TaxAmount: fSelectedTax,
                GrossAmount: fSelectedGross,
                Remaining: fRemaining,
                IsBalanced: bIsBalanced
            });
        },

        /* ============================================================ */
        /*  Event Handlers                                               */
        /* ============================================================ */

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("home", {}, true);
        },

        onRefresh: function () {
            if (this._sVimDocumentId) {
                this._loadDocument(this._sVimDocumentId);
            }
        },

        onGRSelectionChange: function () {
            this._calculateBalance();
        },

        onPurchaseOrderPress: function () {
            var sPO = this.getView().getModel("detail").getProperty("/PurchaseOrder");
            if (!sPO) { return; }

            var oCrossAppNav = sap.ushell && sap.ushell.Container &&
                sap.ushell.Container.getService("CrossApplicationNavigation");

            if (oCrossAppNav) {
                oCrossAppNav.toExternal({
                    target: { semanticObject: "PurchaseOrder", action: "display" },
                    params: { PurchaseOrder: sPO }
                });
            } else {
                MessageToast.show("Purchase Order: " + sPO);
            }
        },

        onViewInvoice: function () {
            var sVimDocId = this.getView().getModel("detail").getProperty("/VimDocumentId");
            if (!sVimDocId) {
                MessageToast.show(this._getText("msgNoInvoiceImage"));
                return;
            }

            var sUrl = "/sap/opu/odata/sap/ZEDM_VIM_GR_CREATE_SRV/VimImageSet('" +
                encodeURIComponent(sVimDocId) + "')/$value";
            sap.m.URLHelper.redirect(sUrl, true);
        },

        onCreateGoodsReceipt: function () {
            var oModel = this.getView().getModel("detail");
            var sVimDocId = oModel.getProperty("/VimDocumentId");
            var sInvoiceRef = oModel.getProperty("/InvoiceNumber");
            var sPO = oModel.getProperty("/PurchaseOrder");

            var oCrossAppNav = sap.ushell && sap.ushell.Container &&
                sap.ushell.Container.getService("CrossApplicationNavigation");

            if (oCrossAppNav) {
                oCrossAppNav.toExternal({
                    target: { semanticObject: "PurchaseReceipt", action: "create" },
                    params: {
                        PurchaseOrder: sPO,
                        HeaderText: sVimDocId,
                        DeliveryNote: sInvoiceRef
                    }
                });
            } else {
                MessageToast.show("Navigation to Goods Receipt creation is not available outside the Fiori Launchpad.");
            }
        },

        /* ============================================================ */
        /*  Action: Submit (with inline validation)                      */
        /* ============================================================ */

        /**
         * Submit — validates inline first, then shows confirmation dialog.
         * No separate validate button needed.
         */
        onSubmit: function () {
            var oDetailModel = this.getView().getModel("detail");
            var bIsBalanced = oDetailModel.getProperty("/Balance/IsBalanced");
            var iSelectedCount = oDetailModel.getProperty("/SelectedGRCount");
            var sCreditMemo = oDetailModel.getProperty("/CreditMemo");

            // Inline validation — check before showing dialog
            if (sCreditMemo !== "X" && iSelectedCount === 0) {
                MessageBox.warning(this._getText("msgNoGRSelected"));
                return;
            }

            if (!bIsBalanced) {
                MessageBox.warning(this._getText("msgBalanceNotZero"));
                return;
            }

            // All checks passed — show confirmation dialog
            var that = this;
            if (!this._oSubmitDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "zfc.finux.zfcvimgr.view.fragment.SubmitDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oSubmitDialog = oDialog;
                    that.getView().addDependent(oDialog);
                    oDialog.setModel(oDetailModel, "detail");
                    oDialog.setModel(that.getView().getModel("i18n"), "i18n");
                    oDialog.open();
                });
            } else {
                this._oSubmitDialog.open();
            }
        },

        onSubmitConfirm: function () {
            var that = this;
            this._oSubmitDialog.close();
            BusyIndicator.show(0);

            this._callAction("submitGR").then(function () {
                BusyIndicator.hide();
                MessageBox.success(that._getText("msgSubmitSuccess"), {
                    onClose: function () {
                        that.onRefresh();
                    }
                });
            }).catch(function (oError) {
                BusyIndicator.hide();
                that._showActionError(oError, "msgSubmitError");
            });
        },

        onSubmitCancel: function () {
            this._oSubmitDialog.close();
        },

        /* ============================================================ */
        /*  Action: Reject                                               */
        /* ============================================================ */

        onReject: function () {
            var that = this;
            var oDetailModel = this.getView().getModel("detail");
            oDetailModel.setProperty("/RejectReason", "");

            if (!this._oRejectDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "zfc.finux.zfcvimgr.view.fragment.RejectDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oRejectDialog = oDialog;
                    that.getView().addDependent(oDialog);
                    oDialog.setModel(oDetailModel, "detail");
                    oDialog.setModel(that.getView().getModel("i18n"), "i18n");
                    oDialog.open();
                });
            } else {
                this._oRejectDialog.open();
            }
        },

        onRejectConfirm: function () {
            var oDetailModel = this.getView().getModel("detail");
            var sReason = oDetailModel.getProperty("/RejectReason");

            if (!sReason || sReason.trim() === "") {
                MessageBox.warning(this._getText("msgRejectReasonRequired"));
                return;
            }

            var that = this;
            this._oRejectDialog.close();
            BusyIndicator.show(0);

            this._callAction("reject").then(function () {
                BusyIndicator.hide();
                MessageBox.success(that._getText("msgRejectSuccess"), {
                    onClose: function () {
                        that.onRefresh();
                    }
                });
            }).catch(function (oError) {
                BusyIndicator.hide();
                that._showActionError(oError, "msgRejectError");
            });
        },

        onRejectCancel: function () {
            this._oRejectDialog.close();
        },

        /* ============================================================ */
        /*  OData V4 Action Invocation                                   */
        /* ============================================================ */

        _callAction: function (sActionName) {
            var oDataModel = this.getOwnerComponent().getModel();
            var sPath = "/VIMDocument('" + this._sVimDocumentId + "')";

            var oActionContext = oDataModel.bindContext(
                sPath + "/com.sap.gateway.srvd_a2x.z_zfc_vim_doc_srv.v0001." + sActionName + "(...)"
            );

            return oActionContext.execute().then(function () {
                return oActionContext.getBoundContext().requestObject();
            });
        },

        /* ============================================================ */
        /*  Helpers                                                      */
        /* ============================================================ */

        _showActionError: function (oError, sDefaultMsgKey) {
            var sMessage = this._getText(sDefaultMsgKey);
            if (oError && oError.message) {
                sMessage = oError.message;
            } else if (oError && oError.error && oError.error.message) {
                sMessage = oError.error.message;
            }
            MessageBox.error(sMessage);
        },

        /**
         * Update the FLP shell bar title based on document type.
         */
        _updateShellTitle: function (bIsCreditMemo) {
            var sTitle = bIsCreditMemo
                ? this._getText("creditMemoTitle")
                : this._getText("detailTitle");

            // Update document title (shows in browser tab)
            document.title = sTitle;

            // Update FLP shell title if running in Launchpad
            try {
                var oShellUIService = this.getOwnerComponent().getService("ShellUIService");
                if (oShellUIService && oShellUIService.then) {
                    oShellUIService.then(function (oService) {
                        oService.setTitle(sTitle);
                    });
                }
            } catch (e) {
                // Not in FLP — ignore
            }
        },

        _getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n")
                .getResourceBundle().getText(sKey, aArgs);
        },

        _formatStatus: function (sStatus) {
            if (!sStatus) { return ""; }
            var mStatuses = {
                "02": "Workflow", "03": "Processing", "06": "Rescan Complete",
                "08": "Confirmed Duplicate", "10": "Obsolete", "15": "Posted",
                "16": "Deleted", "18": "Blocked"
            };
            var sText = mStatuses[sStatus];
            return sText ? sStatus + " (" + sText + ")" : sStatus;
        },

        _getStatusIcon: function (iCriticality) {
            switch (iCriticality) {
                case 1: return "sap-icon://status-positive";
                case 2: return "sap-icon://status-critical";
                case 3: return "sap-icon://status-negative";
                default: return "sap-icon://status-inactive";
            }
        },

        _formatDate: function (vDate) {
            if (!vDate) { return ""; }
            var oDate;
            if (vDate instanceof Date) {
                oDate = vDate;
            } else if (typeof vDate === "string") {
                oDate = new Date(vDate);
                if (isNaN(oDate.getTime()) && vDate.length === 8) {
                    oDate = new Date(
                        vDate.substring(0, 4) + "-" +
                        vDate.substring(4, 6) + "-" +
                        vDate.substring(6, 8)
                    );
                }
            }
            if (!oDate || isNaN(oDate.getTime())) { return String(vDate); }
            var sDay = String(oDate.getDate()).padStart(2, "0");
            var sMonth = String(oDate.getMonth() + 1).padStart(2, "0");
            return sDay + "." + sMonth + "." + oDate.getFullYear();
        },

        /* ============================================================ */
        /*  Cleanup                                                      */
        /* ============================================================ */

        onExit: function () {
            if (this._oSubmitDialog) { this._oSubmitDialog.destroy(); }
            if (this._oRejectDialog) { this._oRejectDialog.destroy(); }
        }
    });
});
