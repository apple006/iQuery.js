(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('iQuery+', ['jQuery+'], arguments[0]);

})(function () {



});