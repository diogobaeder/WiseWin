
window.EasyData = window.EasyData || {};

(function(ED) {
    

ED.utils = {
    stringToMap: function(string, options) {
        var elSp = options.elementSpacer || ';',
            attrSp = options.attributionSpacer || '=',
            allowLists = options.allowLists,
            map = {},
            attr = string.split(elSp),
            i, length,
            currEl,
            currMapEl;
		
		for (i = 0, length = attr.length; i < length; i++) {
			currEl = ED.utils.trim(attr[i]).split(attrSp);
			currMapEl = map[currEl[0]];
			
			if (!currMapEl && allowLists) {
				map[currEl[0]] = [currEl[1]];
			}
			else if (!currMapEl) {
                map[currEl[0]] = currEl[1];
			}
			else if (allowLists) {
				currMapEl.push(currEl[1]);
			}
		}
        
        return map;
    },
  
    mapToString: function(map, options) {
        var string = '',
            elSp = options.elementSpacer || ';',
            attrSp = options.attributionSpacer || '=',
            currKey;
            
        for (currKey in map) {
            if (string.length) string += elSp;
            if (map[currKey].constructor == Array) {
                string += currKey + attrSp + map[currKey].join(elSp + currKey + attrSp);
            }
            else {
                string += currKey + attrSp + map[currKey];
            }
        }
        
        return string;
    },
  
    removeProp: function(prop, map) {
        var tmp = map[prop];
        delete map[prop];
        return tmp;
    },
    
    cloneMap: function(map) {
        if (!map) return map;
        var finalObj = {}, prop;
        for (prop in map) {
            if (map.hasOwnProperty(prop)) {
                finalObj[prop] = map[prop];
            }
        }
        return finalObj;
    },
  
	trim: function(string) {
		return string.replace(/^\s+/, '').replace(/\s+$/, '');
	}
};


ED.Cookies = (function(){
    var cookies = null;
    
    function init(forcedReset) {
        if (cookies === null || forcedReset) {
            cookies = ED.utils.stringToMap(document.cookie.toString(), {
                elementSpacer: ';',
                attributionSpacer: '=',
                allowLists: false
            });
        }
    }
    
    var methods = {
        get: function(key, serialized) {
            var cookie;
            
            init();
            cookie = cookies[key] || "";
            return (serialized && cookie && JSON) ? JSON.parse(cookie) : cookie;
        },
			   
		all: function() {
			return cookies;
		},
        
        set: function(key, value, serialized, options) {
            var secure, optString;
            // Method overloading. options can be passed as a third argument.
            if (!options && typeof serialized == 'object') {
                options = serialized;
                serialized = options.serialized;
            }
            
            // Cloned object to avoid client code interference.
            options = ED.utils.cloneMap(options);
            
            init();
            if (serialized && JSON) value = JSON.stringify(value);
            if (options) {
                ED.utils.removeProp('serialized', options);
                secure = ED.utils.removeProp('secure', options);
                optString = ED.utils.mapToString(options, {
                    elementSpacer: ';',
                    attributionSpacer: '='
                });
                if (secure) {
                    optString += (optString ? ';secure' : 'secure');
                }
                value += ';' + optString;
            }
            cookies[key] = value;
            document.cookie = key + '=' + value;
            return this;
        },
        
        reset: function() {
            init(true);
        }
    };
    
    return methods;
})();


ED.location = {
    /**
    queryString - returns the query string in form of a map/dictionary
    Parameters:
    - allowLists (Boolean): allows query string construction to expect repeated keys (use ED.location.queryString.flush() if you wish to change this argument) 
    */
    queryString: (function(){
        var qs = null,
            get;
        
        get = function(allowLists) {
            if (qs) return qs;
            
            qs = ED.utils.stringToMap({
                allowLists: allowLists,
                string: location.search && location.search.slice(1),
                elementSpacer: '&',
                attributionSpacer: '='
            });
            return qs;
        };
        
        get.flush = function() {
            qs = null;
        };
        
        return get;
    })(),
    
    /**
    redirect - requests the URL passed as argument. If isIE6 is passed as true, uses a different means so to not show alert window for pages under SSL being redirected to non-secure pages.
    */
    redirect: function(url, isIE6) {
        if (!isIE6) location.href = url;
        else location.replace(url);
    },
    
    /**
    SmartPage - manages page loads using location hash. Very usefull for Ajax requests with changes to the location
    */
    SmartPage: (function(){
        var methods,
            observers = [];
        methods = {
            addObserver: function(callback) {
                observers.push(callback);
                return methods;
            },
            
            load: function(url) {
                url = (url && url.replace('#', '')) || '';
                location.hash = '#'+url;
                return methods.fire(url);
            },
            
            fire: function(url) {
                var i, url = url.replace('#', '');
                for (i = 0; i < observers.length; i++) {
                    observers[i](url);
                }
                return methods;
            }
        };
        return methods;
    })()
};


})(EasyData);
    