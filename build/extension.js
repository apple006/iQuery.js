({
    name:            'extension/jQuery+',
    baseUrl:         '../source/',
    paths:           {
        jquery:    'http://cdn.bootcss.com/jquery/1.12.3/jquery'
    },
    out:             '../source/jQuery+.js',
    onBuildWrite:    function (iName) {
        if (iName.indexOf('extension') < 0)  return '';

        var fParameter = 'BOM',  aParameter = 'self';

        if (iName != 'extension/ES-5') {
            fParameter += ', DOM, $';
            aParameter += ',  self.document,  self.jQuery';
        }
        return arguments[2]
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1" + fParameter)
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\).$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:            {
        startFile:    'jQuery+_Wrap.txt',
        end:          '});'
    },
    optimize:        'none'
});