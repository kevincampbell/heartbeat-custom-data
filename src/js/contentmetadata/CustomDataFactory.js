/* -----------------------------------
 CustomDataFactory.js
 ------------------------------------- */

/**
 * This class translates keys used in model JSON objects, eg. [SHOW_NAME], and returns clip metadata.
 *
 * @param {EventDispatcher} _pdkEventDispatcher the event
 *    dispatcher for events related to the PDK - our custom metadata is also dispatched.
 * */
function CustomDataFactory(_pdkEventDispatcher) {
    var pdkEventDispatcher = _pdkEventDispatcher;
    pdkEventDispatcher.addEventListener(ContentMetadataEvent.CONTENT_METADATA_UPDATE, onContentMetadataUpdate);
    pdkEventDispatcher.addEventListener("pageToPlayerEvent", onPageToPlayer);
    var contentMetadata = null;
    var mvpdid = null;
    var params = {};
    if ((location.search.toLowerCase()).indexOf("fwautoplay") > -1) {
        params.fwautoplay = getParameterByName("fwautoplay");
    }
    params.autoplay = getParameterByName("autoplay");

    /**
     * Public functions
     */
    this.initialized = function() {
        if (contentMetadata === null) {
            return false;
        } else {
            return true;
        }
    };

    this.getCustomData = function (key) {
        var val = "";
        if (contentMetadata != null) {
            val = replaceKey(key);
        }
        return val;
    };

    /**
     * Private functions
     */
    function onContentMetadataUpdate(event) {
        contentMetadata = event.data;
        console.log("[NBCHeartbeatApp] CustomDataFactory.onContentMetadataUpdate()");
    }

    function onPageToPlayer(event) {
        if (event.data.mvpdid && event.data.mvpdid != 'undefined') {
            mvpdid = event.data.mvpdid;
            console.log("[NBCHeartbeatApp] CustomDataFactory.onPageToPlayer() mvpd: " + mvpdid);
        }
    }

    function replaceKey(str) {
        var d = new Date();

        str = str.split("[SHOW_NAME]").join(contentMetadata.getShowName());
        str = str.split("[DAY_PART]").join(contentMetadata.getDayPart());
        str = str.split("[FORMATTED_MINUTES]").join(formatWithTwoDigits(d.getHours()) + ":" + formatWithTwoDigits(d.getMinutes()));
        str = str.split("[DATE_GET_HOURS]").join(formatHours(d.getHours()));
        str = str.split("[DAY_OF_WEEK]").join(weekdays[d.getDay()]);str = str.split("[MONTH]").join(formatWithTwoDigits(d.getMonth() + 1));
        str = str.split("[DATE_GET_DATE]").join(formatWithTwoDigits(d.getDate()));
        str = str.split("[DATE_GET_FULL_YEAR]").join(d.getFullYear());
        str = str.split("[PLATFORM]").join(getPlatform());
        str = str.split("[MVPD]").join(getMVPD());
        str = str.split("[INITIATE]").join(getInitiateValue());
        str = str.split("[PRIMARY_CATEGORY]").join(getPrimaryCategory());
        str = str.split("[SECONDARY_CATEGORY]").join(getSecondaryCategory());

        return str;
    }

    function formatWithTwoDigits(d) {
        return ('0' + d).slice(-2);
    }

    function formatHours(n) {
        return formatWithTwoDigits(n) + ":00";
    }

    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    function isMobile() {
        return navigator.userAgent.toLowerCase().match(/iphone|ipad|ipod|android|webos|palm|googletv|silk|windows phone|trident.*wp[1-9]|blackberry|bb10/) ? true : false;
    }

    function getPlatform() {
        return isMobile() ? 'Mobile' : 'PC';
    }

    function getMVPD() {
        if (mvpdid != null) {
            return mvpdid;
        } else {
            return "";
        }
    }

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search.toLowerCase());
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function hasAutoPlayParameters() {
        return (params.fwautoplay) ? ("false" !== String(params.fwautoplay)) : ("true" === String(params.autoplay));
    }

    function getInitiateValue() {
        return (hasAutoPlayParameters()) ? "Auto Play" : "Manual";
    }

    function getPrimaryCategory() {
        var primary = "";
        if (contentMetadata.getPrimaryCategory() !== null) primary= contentMetadata.getPrimaryCategory();
        return primary;
    }

    function getSecondaryCategory() {
        var secondary = "";
        if (contentMetadata.getSecondaryCategory() !== null) secondary = contentMetadata.getSecondaryCategory();
        return secondary;
    }
}