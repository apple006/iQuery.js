define(['extension/iTimer'],  function ($) {

    var BOM = self,  DOM = self.document;


/* ---------- jQuery Object Core ---------- */

    var DOM_Type = $.makeSet('Window', 'Document', 'HTMLElement');

    function iQuery(Element_Set, iContext) {

        /* ----- Global Wrapper ----- */

        var _Self_ = arguments.callee;

        if (! (this instanceof _Self_))
            return  new _Self_(Element_Set, iContext);

        if (Element_Set instanceof _Self_)  return Element_Set;

        /* ----- Constructor ----- */

        this.length = 0;

        if (! Element_Set) return;

        var iType = $.Type(Element_Set);

        if (iType == 'String') {
            Element_Set = Element_Set.trim();

            if (Element_Set[0] != '<') {
                this.context = iContext || DOM;

                this.selector = Element_Set;

                Element_Set = $.find(Element_Set, this.context);

                Element_Set = (Element_Set.length < 2)  ?
                    Element_Set  :  $.uniqueSort(Element_Set);
            } else {
                Element_Set = $.map(_Self_.parseHTML(Element_Set),  function () {

                    if (arguments[0].nodeType == 1)  return arguments[0];
                });

                if ((Element_Set.length == 1)  &&  $.isPlainObject( iContext ))
                    for (var iKey in iContext) {
                        if (typeof this[iKey] == 'function')
                            (new _Self_( Element_Set[0] ))[iKey]( iContext[iKey] );
                        else
                            (new _Self_( Element_Set[0] )).attr(iKey, iContext[iKey]);
                    }
            }
        } else if (iType in DOM_Type)
            Element_Set = [ Element_Set ];

        if (! $.likeArray(Element_Set))
            return;

        $.merge(this, Element_Set);

        if (Element_Set.length == 1)
            this.context = (Element_Set[0] || '').ownerDocument;
    }

    /* ----- iQuery Static Method ----- */

    var TagWrapper = $.extend(
            {
                area:      {before: '<map>'},
                legend:    {before: '<fieldset>'},
                param:     {before: '<object>'}
            },
            $.makeSet(['caption', 'thead', 'tbody', 'tfoot', 'tr'],  {
                before:    '<table>',
                after:     '</table>',
                depth:     2
            }),
            $.makeSet(['th', 'td'],  {
                before:    '<table><tr>',
                depth:     3
            }),
            $.makeSet(['optgroup', 'option'],  {before: '<select multiple>'})
        );

    function QuerySelector(iPath) {
        var iRoot = this;

        if ((this.nodeType == 9)  ||  (! this.parentNode))
            return iRoot.querySelectorAll(iPath);

        var _ID_ = this.getAttribute('id');

        if (! _ID_) {
            _ID_ = $.uuid('iQS');
            this.setAttribute('id', _ID_);
        }
        iPath = '#' + _ID_ + ' ' + iPath;
        iRoot = this.parentNode;

        iPath = iRoot.querySelectorAll(iPath);

        if (_ID_.slice(0, 3)  ==  'iQS')  this.removeAttribute('id');

        return iPath;
    }

    iQuery.fn = iQuery.prototype;

    $ = BOM.iQuery = $.extend(true, iQuery, $, {
        parseHTML:     function (iHTML) {
            var iTag = iHTML.match(
                    /^\s*<([^\s\/\>]+)\s*([^<]*?)\s*(\/?)>([^<]*)((<\/\1>)?)([\s\S]*)/
                ) || [ ];

            if (iTag[5] === undefined)  iTag[5] = '';

            if (
                (iTag[5]  &&  (! (iTag.slice(2, 5).join('') + iTag[6])))  ||
                (iTag[3]  &&  (! (iTag[2] + iTag.slice(4).join(''))))
            )
                return  [DOM.createElement( iTag[1] )];

            var iWrapper = TagWrapper[ iTag[1] ],
                iNew = DOM.createElement('div');

            if (! iWrapper)
                iNew.innerHTML = iHTML;
            else {
                iNew.innerHTML =
                    iWrapper.before  +  iHTML  +  (iWrapper.after || '');
                iNew = $.trace(iNew,  'firstChild',  iWrapper.depth || 1)
                    .slice(-1)[0];
            }

            return $.map(
                $.makeArray(iNew.childNodes),
                function (iDOM) {
                    return iDOM.parentNode.removeChild(iDOM);
                }
            );
        },
        find:          function (iSelector, iRoot) {
            var _Self_ = arguments.callee;

            return  $.map(iSelector.split(/\s*,\s*/),  function (_Selector_) {
                var iPseudo = [ ],  _Before_,  _After_ = _Selector_;

                while (! (iPseudo[1] in $.expr[':'])) {
                    iPseudo = _After_.match(/:(\w+)(\(('|")?([^'"]*)\3?\))?/);

                    if (! iPseudo)
                        return  $.makeArray(QuerySelector.call(iRoot, _Selector_));

                    _Before_ = iPseudo.index  ?
                        _After_.slice(0, iPseudo.index)  :  '*';

                    _After_ = _After_.slice(iPseudo.index + iPseudo[0].length)
                }

                if (_Before_.match(/[\s>\+~]\s*$/))  _Before_ += '*';

                iPseudo.splice(2, 1);

                return $.map(
                    QuerySelector.call(iRoot, _Before_),
                    function (iDOM, Index) {
                        if ($.expr[':'][iPseudo[1]](iDOM, Index, iPseudo))
                            return  _Self_(_After_, iDOM);
                    }
                );
            });
        },
        uniqueSort:    $.browser.msie ?
            function (iSet) {
                var $_Temp = [ ],  $_Result = [ ];

                for (var i = 0;  i < iSet.length;  i++) {
                    $_Temp[i] = new String(iSet[i].sourceIndex + 1e8);
                    $_Temp[i].DOM = iSet[i];
                }
                $_Temp.sort();

                for (var i = 0, j = 0;  i < $_Temp.length;  i++)
                    if ((! i)  ||  (
                        $_Temp[i].valueOf() != $_Temp[i - 1].valueOf()
                    ) || (
                        $_Temp[i].DOM.outerHTML  !=  $_Temp[i - 1].DOM.outerHTML
                    ))
                        $_Result[j++] = $_Temp[i].DOM;

                return $_Result;
            } :
            function (iSet) {
                iSet.sort(function (A, B) {
                    return  (A.compareDocumentPosition(B) & 2) - 1;
                });

                var $_Result = [ ];

                for (var i = 0, j = 0;  i < iSet.length;  i++) {
                    if (i  &&  (iSet[i] === iSet[i - 1]))  continue;

                    $_Result[j++] = iSet[i];
                }

                return $_Result;
            }
    });

    if (typeof BOM.jQuery != 'function')  BOM.$ = BOM.jQuery = $;

    /* ----- iQuery Instance Method ----- */

    $.fn.extend = $.extend;

    $.fn.extend({
        splice:         Array.prototype.splice,
        pushStack:      function ($_New) {
            $_New = $($.uniqueSort(
                ($_New instanceof Array)  ?  $_New  :  $.makeArray($_New)
            ));
            $_New.prevObject = this;

            return $_New;
        },
        index:          function (iTarget) {
            if (! iTarget)
                return  $.trace(this[0], 'previousElementSibling').length;

            var iType = $.Type(iTarget);

            switch (true) {
                case (iType == 'String'):
                    return  $.inArray(this[0], $(iTarget));
                case ($.likeArray( iTarget )):
                    if (! (iType in DOM_Type)) {
                        iTarget = iTarget[0];
                        iType = $.Type(iTarget);
                    }
                case (iType in DOM_Type):
                    return  $.inArray(iTarget, this);
            }
            return -1;
        }
    });

    return $;

});
