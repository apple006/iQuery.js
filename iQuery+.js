if ((typeof this.define != 'function')  ||  (! this.define.amd))
    this.define = function () {
        return  arguments[arguments.length - 1]();
    };

define('iQuery+',  function () {


(function (BOM, DOM, $) {

    function Observer() {
        this.requireArgs = arguments[0] || 0;
        this.filter = arguments[1] || [ ];
        this.table = [[ ]];

        return this;
    }

    function Each_Row() {
        var _This_ = this,  iArgs = $.makeArray(arguments);

        if (typeof iArgs[iArgs.length - 1]  !=  'function')  return;

        var iCallback = iArgs.pop();

        $.each(this.table[0],  function (Index) {
            if (this == null)  return;

            for (var i = 0, _Condition_;  i < iArgs.length;  i++) {
                _Condition_ = _This_.table[i + 1][Index];

                if (_Condition_ === undefined) {

                    if (i < _This_.requireArgs)  return;

                } else if (
                    (_Condition_ != iArgs[i])  ||
                    (! iArgs[i].match(_Condition_))  ||  (
                        (typeof _This_.filter[i] == 'function')  &&
                        (false === _This_.filter[i].call(
                            _This_,  _Condition_,  iArgs[i]
                        ))
                    )
                )
                    return;
            }

            if (false  ===  iCallback.call(_This_, this))
                _This_.table[0][Index] = null;
        });
    }

    $.extend(Observer.prototype, {
        on:         function () {
            var iArgs = $.makeArray(arguments);

            if (typeof iArgs[iArgs.length - 1]  ==  'function') {
                var Index = this.table[0].push( iArgs.pop() )  -  1;

                for (var i = 0;  i < iArgs.length;  i++) {
                    if (! this.table[i + 1])
                        this.table[i + 1] = [ ];

                    this.table[i + 1][Index] = iArgs[i];
                }
            }
            return this;
        },
        off:        function () {
            var _This_ = this,  iArgs = $.makeArray(arguments);

            var iCallback = (typeof iArgs[iArgs.length - 1]  ==  'function')  &&
                    iArgs.pop();

            iArgs.push(function () {
                return  (iCallback !== false)  &&  (iCallback !== arguments[0]);
            });

            Each_Row.apply(this, iArgs);

            return this;
        },
        one:        function () {
            var _This_ = this,  iArgs = $.makeArray(arguments);

            if (typeof iArgs[iArgs.length - 1]  ==  'function') {
                var iCallback = iArgs.pop();

                iArgs.push(function () {
                    this.off.apply(this, iArgs);

                    return  iCallback.apply(this, arguments);
                });

                this.on.apply(this, iArgs);
            }

            return this;
        },
        trigger:    function () {
            var iArgs = $.makeArray(arguments),  iReturn;

            var iData = $.likeArray(iArgs[iArgs.length - 1])  &&  iArgs.pop();

            iArgs.push(function () {
                var _Return_ = arguments[0].apply(this, iData);

                iReturn = $.isData(_Return_) ? _Return_ : iReturn;
            });

            Each_Row.apply(this, iArgs);

            return iReturn;
        }
    });

    $.Observer = Observer;

})(self, self.document, self.jQuery);


/* ---------- ListView Interface  v0.7 ---------- */

//  Thanks "EasyWebApp" Project --- http://git.oschina.net/Tech_Query/EasyWebApp


(function (BOM, DOM, $) {

    var Click_Type = $.browser.mobile ? 'tap' : 'click';

    function ListView($_View, $_Item, onInsert) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, $_Item, onInsert);

        $_View = $($_View);
        if (typeof $_Item == 'function') {
            onInsert = $_Item;
            $_Item = null;
        }

        var iView = _Self_.getInstance($_View) || $.Observer.call(this, 1);

        if (onInsert)  iView.on('insert', onInsert);

        if (iView !== this)  return iView;

        this.$_View = $_View.data('_LVI_', this);

        this.selector = $_Item;
        this.length = 0;

        for (;  ;  this.length++) {
            $_Item = this.itemOf(this.length);

            if (! $_Item.length)  break;

            this[this.length] = $_Item;
        }

        _Self_.findView(this.$_View, false);

        this.$_Template = this[0].clone(true);

        this.$_View.on(Click_Type,  '.ListView_Item',  function (iEvent) {
            var $_This = $(this);

            if (
                (! $_This.hasClass('active'))  &&
                $_This.scrollParents().is(
                    'a[href], *[tabIndex], *[contentEditable]'
                )
            )
                _Self_.getInstance(this.parentNode).focus(this);
        });
    }

    $.extend(ListView, {
        getInstance:    function () {
            var _Instance_ = $(arguments[0]).data('_LVI_');
            return  ((_Instance_ instanceof this)  &&  _Instance_);
        },
        findView:       function ($_View, Init_Instance) {
            $_View = $($_View).find(
                'ul, ol, dl, tbody, select, datalist, *[multiple]'
            ).not('input[type="file"]');

            if (Init_Instance === true) {
                for (var i = 0;  i < $_View.length;  i++)
                    if (! this.getInstance($_View[i]))  this( $_View[i] );
            } else if (Init_Instance === false)
                $_View.data('_LVI_', null);

            return $_View;
        }
    });

    function New_Item($_Item, Index) {
        var $_Clone = this.$_Template.clone(true);

        if (! Index)
            this.$_View.prepend($_Clone);
        else {
            if (! $_Item.length)
                this.itemOf(Index - 1).slice(-1).after($_Clone);
            else
                $_Item.eq(0).before($_Clone);
        }

        return $_Clone;
    }

    ListView.prototype = $.extend(new $.Observer(),  {
        constructor:    ListView,
        getSelector:    function () {
            return  this.selector ?
                this.selector.join(', ') : [
                    this.$_Template[0].tagName.toLowerCase()
                ].concat(
                    (this.$_Template.attr('class') || '').split(/\s+/)
                ).join('.').trim('.');
        },
        itemOf:         function (Index) {
            Index = Index || 0;

            var _This_ = this,  $_Item = this.$_View[0].children[Index];

            return $(
                this.selector ?
                    $.map(this.selector,  function () {
                        return  _This_.$_View.children( arguments[0] )[Index];
                    }) :
                    ($_Item ? [$_Item] : [ ])
            );
        },
        slice:          Array.prototype.slice,
        indexOf:        function (Index, getInstance) {
            if (! isNaN(Number( Index )))
                return  this.slice(Index,  (Index + 1) || undefined)[0];

            var $_Item = $(Index);

            for (var i = 0;  i < this.length;  i++)
                if (this[i].index($_Item[0]) > -1)
                    return  getInstance  ?  arguments.callee.call(this, i)  :  i;

            return  getInstance ? $() : -1;
        },
        splice:         Array.prototype.splice,
        insert:         function (iValue, Index) {
            iValue = (iValue === undefined)  ?  { }  :  iValue;

            Index = parseInt(Index) || 0;
            Index = (Index < this.length)  ?  Index  :  this.length;

            var $_Item = this.itemOf(Index);
            var _Insert_ = (
                    (! $_Item.length)  ||  $_Item.hasClass('ListView_Item')
                );
            if (_Insert_)  $_Item = New_Item.call(this, $_Item, Index);

            var _Index_ = (Index < 0)  ?  (Index - 1)  :  Index;

            var iReturn = this.trigger('insert',  [$_Item, iValue, _Index_]);

            if (_Insert_) {
                $_Item = this.itemOf(_Index_);
                this.splice(Index, 0, $_Item);
            }
            iValue = (iReturn === undefined) ? iValue : iReturn;

            $_Item.addClass('ListView_Item').data('LV_Model', iValue);

            return this.indexOf(_Index_);
        },
        render:         function (iData) {
            iData = $.likeArray(iData) ? iData : [iData];

            for (var i = 0;  i < iData.length;  i++)
                this.insert(iData[i], i);

            this.trigger('afterRender', [iData]);

            return this;
        },
        valueOf:        function (Index) {
            if (Index  ||  (Index == 0))
                return  this.indexOf(arguments[0], true).data('LV_Model');

            var iData = this.$_View.data('LV_Model') || [ ];

            if (! iData[0]) {
                for (var i = 0;  i < this.length;  i++)
                    iData.push( this[i].data('LV_Model') );

                this.$_View.data('LV_Model', iData);
            }
            return iData;
        },
        remove:         function (Index) {
            var $_Item = this.indexOf(Index);

            if (typeof $_Item == 'number') {
                if ($_Item < 0)  return this;
                Index = $_Item;
                $_Item = this.indexOf(Index);
            }
            if (
                $_Item.length  &&
                (false  !==  this.trigger('remove', [
                    $_Item,  this.valueOf(Index),  Index
                ]))
            )
                this.splice(Index, 1)[0].remove();

            return this;
        },
        clear:          function () {
            this.splice(0, this.length);
            this.$_View.empty();

            return this;
        },
        focus:          function () {
            var $_Item = this.indexOf(arguments[0], true);

            if ( $_Item[0] ) {
                $_Item.siblings().removeClass('active');
                $_Item.scrollParents().eq(0).focus().scrollTo(
                    $_Item.addClass('active')
                );
            }
            return this;
        },
        sort:           function (iCallback) {
            var iLV = this;

            Array.prototype.sort.call(
                iLV,
                function ($_A, $_B) {
                    return  iCallback.apply(iLV, [
                        $_A.data('LV_Model'),  $_B.data('LV_Model'),  $_A,  $_B
                    ]);
                }
            );
            Array.prototype.unshift.call(iLV, [ ]);

            $($.merge.apply($, iLV)).detach().appendTo( iLV.$_View );

            Array.prototype.shift.call( iLV );

            return iLV;
        },
        fork:           function () {
            var $_View = this.$_View.clone(true);

            $_View.data({_LVI_: '',  LV_Model: ''})[0].id = '';

            var iFork = ListView($_View.appendTo( arguments[0] ),  this.selector);
            iFork.$_Template = this.$_Template.clone(true);
            iFork.callback = this.callback;

            return iFork;
        }
    });

    $.ListView = ListView;

})(self, self.document, self.jQuery);


/* ---------- TreeView Interface  v0.3 ---------- */


(function (BOM, DOM, $) {

    function TreeView(iListView, iKey, onFork, onFocus) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_(iListView, iKey, onFork, onFocus);

        var _This_ = $.Observer.call(this, 1).on('branch', onFork);

        iKey = iKey || 'list';

        this.unit = iListView.on('insert',  function ($_Item, iValue) {
            if ($.likeArray( iValue[iKey] )  &&  iValue[iKey][0])
                _This_.branch(this, $_Item, iValue[iKey]);
        });

        this.listener = [
            $.browser.mobile ? 'tap' : 'click',
            iListView.getSelector(),
            function (iEvent) {
                if ( $(iEvent.target).is(':input') )  return;

                if ( iEvent.isPseudo() )
                    $(this).children('.TreeNode').toggle(200);

                $('.ListView_Item.active', _This_.unit.$_View[0]).not(this)
                    .removeClass('active');

                if (typeof onFocus != 'function')  return;

                var $_Target = onFocus.apply(this, arguments);

                if ($_Target && _This_.$_Content) {
                    _This_.$_Content.scrollTo( $_Target );
                    return false;
                }
            }
        ];
        $.fn.on.apply(iListView.$_View.addClass('TreeNode'), this.listener);
    }

    TreeView.prototype = $.extend(new $.Observer(),  {
        constructor:    TreeView,
        branch:         function (iListView, $_Item, iData) {
            var iFork = iListView.fork($_Item).clear().render(iData);

            iFork.$_View.children().removeClass('active');

            this.depth = iFork.$_View.parentsUntil( this.unit.$_View )
                .filter('TreeNode').length + 1;
            this.trigger('branch',  [iFork, iData, this.depth]);

            $.fn.off.apply(iFork.$_View.addClass('TreeNode'), this.listener);

            return iFork;
        },
        bind:           function ($_Item, Depth_Sort, Data_Filter) {
            this.$_Content = $_Item.sameParents().eq(0);
            this.data = [ ];

            for (
                var  i = 0,  _Tree_ = this.data,  _Level_ = 0,  _Parent_;
                i < $_Item.length;
                i++
            ) {
                if (i > 0)
                    _Level_ = Depth_Sort.call(this,  $_Item[i - 1],  $_Item[i]);

                if (_Level_ > 0)
                    _Tree_ = _Tree_.slice(-1)[0].list = $.extend([ ], {
                        parent:    _Tree_
                    });
                else if (_Level_ < 0) {
                    _Parent_ = _Tree_.parent;
                    delete _Tree_.parent;
                    _Tree_ = _Parent_;
                }
                _Tree_.push( Data_Filter.call($_Item[i]) );
            }

            this.unit.clear().render( this.data );

            return this;
        },
        linkage:        function ($_Scroll, onScroll) {
            var _DOM_ = $_Scroll[0].ownerDocument;

            $_Scroll.scroll(function () {
                if (arguments[0].target !== this)  return;

                var iAnchor = $_Scroll.offset(),
                    iFontSize = $(_DOM_.body).css('font-size') / 2;

                var $_Anchor = $(_DOM_.elementFromPoint(
                        iAnchor.left + $_Scroll.css('padding-left') + iFontSize,
                        iAnchor.top + $_Scroll.css('padding-top') + iFontSize
                    ));
                return  onScroll.call(this, $_Anchor);
            });

            return this;
        }
    });

    $.TreeView = TreeView;

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- Base64 to Blob  v0.1 ---------- */

//  Thanks "axes" --- http://www.cnblogs.com/axes/p/4603984.html

    $.toBlob = function (iType, iString) {
        if (arguments.length == 1) {
            iString = iType.match(/^data:([^;]+);base64,(.+)/);
            iType = iString[1];
            iString = iString[2];
        }
        iString = BOM.atob(iString);

        var iBuffer = new ArrayBuffer(iString.length);
        var uBuffer = new Uint8Array(iBuffer);

        for (var i = 0;  i < iString.length;  i++)
            uBuffer[i] = iString.charCodeAt(i);

        var BlobBuilder = BOM.WebKitBlobBuilder || BOM.MozBlobBuilder;

        if (! BlobBuilder)
            return  new BOM.Blob([iBuffer],  {type: iType});

        var iBuilder = new BlobBuilder();
        iBuilder.append(iBuffer);
        return iBuilder.getBlob(iType);
    };

/* ---------- Hash Algorithm (Crypto API Wrapper)  v0.1 ---------- */

//  Thanks "emu" --- http://blog.csdn.net/emu/article/details/39618297

    function BufferToString(iBuffer){
        var iDataView = new DataView(iBuffer),
            iResult = [ ];

        for (var i = 0, iTemp;  i < iBuffer.byteLength;  i += 4) {
            iTemp = iDataView.getUint32(i).toString(16);
            iResult.push(
                ((iTemp.length == 8) ? '' : '0') + iTemp
            );
        }
        return iResult.join('');
    }

    $.dataHash = function (iAlgorithm, iData, iCallback, iFailback) {
        var iCrypto = BOM.crypto || BOM.msCrypto;
        var iSubtle = iCrypto.subtle || iCrypto.webkitSubtle;

        iAlgorithm = iAlgorithm || 'SHA-512';
        iFailback = iFailback || iCallback;

        try {
            iData = iData.split('');
            for (var i = 0;  i < iData.length;  i++)
                iData[i] = iData[i].charCodeAt(0);

            var iPromise = iSubtle.digest(
                    {name:  iAlgorithm},
                    new Uint8Array(iData)
                );

            if(typeof iPromise.then == 'function')
                iPromise.then(
                    function () {
                        iCallback.call(this, BufferToString(arguments[0]));
                    },
                    iFailback
                );
            else
                iPromise.oncomplete = function () {
                    iCallback.call(
                        this,  BufferToString( arguments[0].target.result )
                    );
                };
        } catch (iError) {
            iFailback(iError);
        }
    };

})(self, self.document, self.jQuery);


//
//              >>>  iQuery+  <<<
//
//
//    [Version]    v1.5  (2016-5-24)  Stable
//
//    [Require]    iQuery  ||  jQuery with jQuery+
//
//
//        (C)2015-2016  shiy2008@gmail.com
//



(function (BOM, DOM, $) {

})(self, self.document, self.jQuery);


});
