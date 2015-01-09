module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    connect: {
      server: {
        options: {
          'hostname': 'localhost',
          port: '7299'
        },
      },
    },
    sass: {
      dist: {
        options: {
          style: 'expanded',
          compass: true
        },
        files: {
          'stylesheets/main.css': 'sass/main.scss'
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },
      styles: {
        files: ['sass/*.scss'],
        tasks: ['sass']
      }
    },
  });


  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

};