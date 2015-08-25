var fs = require('fs')

module.exports = function(grunt) {

    require('jit-grunt')(grunt);

    grunt.initConfig({

        clean: {
            build: ['build']
        },

        nodemon: {
            dev: {
                script: './src/js/cli.js',
                options: {
                    exec: ['babel-node --harmony'],
                    watch: ['src', 'gu.json'],
                    env: { PORT: '4000' }
                }
            }
        }
    });

    grunt.registerTask('build', ['clean'])
    grunt.registerTask('default', ['build', 'nodemon']);
}
