sap.ui.define([
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/Locale"
], function (NumberFormat, Locale) {
    "use strict";

    // Cache the currency formatter instance — locale-specific, reusable
    var _oLocale = new Locale("en-AU");
    var _oCurrencyFormat = NumberFormat.getCurrencyInstance({
        showMeasure: false,
        currencyCode: true,
        currencyContext: "standard"
    }, _oLocale);

    return {

        /**
         * Format a currency amount respecting the currency's decimal places.
         * JPY → 0 decimals, BHD → 3 decimals, AUD/USD/EUR etc. → 2 decimals.
         *
         * Usage in XML view (parts binding):
         *   number="{parts: [{path: 'detail>Amount'}, {path: 'detail>Currency'}], formatter: '.formatter.currencyValue'}"
         *
         * @param {number|string} vValue - The amount
         * @param {string} sCurrency - The ISO currency code (e.g. 'AUD', 'JPY')
         * @returns {string} Formatted number string without currency symbol
         */
        currencyValue: function (vValue, sCurrency) {
            var fVal = parseFloat(vValue);
            if (isNaN(fVal)) {
                fVal = 0;
            }
            if (sCurrency) {
                return _oCurrencyFormat.format(fVal, sCurrency);
            }
            // Fallback if no currency provided
            return fVal.toFixed(2);
        },

        /**
         * Format the status criticality to a ValueState.
         * @param {number} iCriticality - The criticality value (0, 1, 2, 3)
         * @returns {string} The ValueState string
         */
        formatStatusState: function (iCriticality) {
            switch (iCriticality) {
                case 1: return "Success";
                case 2: return "Warning";
                case 3: return "Error";
                case 5: return "Information";
                default: return "Information";
            }
        },

        /**
         * Format a boolean value to Yes/No.
         * @param {*} vValue - The value to check (true, 'X', etc.)
         * @returns {string} "Yes" or "No"
         */
        formatBoolean: function (vValue) {
            return (vValue === true || vValue === "X" || vValue === "x") ? "Yes" : "No";
        }
    };
});
