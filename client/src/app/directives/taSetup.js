var textAngularSetup;

textAngularSetup = angular.module('textAngularSetup', ['Remente', 'common']);

textAngularSetup.value('taOptions', {
  toolbar: [['h1', 'h2', 'h3', 'p', 'pre', 'quote'], ['bold', 'italics', 'underline', 'ul', 'ol', 'undo', 'redo', 'clear'], ['justifyLeft', 'justifyCenter', 'justifyRight'], ['html', 'insertImage', 'insertLink', 'insertVideo']],
  classes: {
    focussed: "focussed",
    toolbar: "btn-toolbar",
    toolbarGroup: "button-bar button-bar-inline",
    toolbarButton: "button button-small icon button-light button-outline",
    toolbarButtonActive: "active",
    mediaButtonGroup: "button-bar button-bar-inline",
    mediaButton: "button button-small",
    disabled: "disabled",
    textEditor: 'form-control',
    htmlEditor: 'form-control'
  },
  setup: {
    textEditorSetup: function($element) {},
    htmlEditorSetup: function($element) {}
  },
  defaultFileDropHandler: function(file, insertAction) {
    var reader;
    reader = new FileReader();
    if (file.type.substring(0, 5) === 'image') {
      reader.onload = function() {
        if (reader.result !== '') {
          return insertAction('insertImage', reader.result, true);
        }
      };
      reader.readAsDataURL(file);
      true;
    }
    return false;
  }
});

textAngularSetup.value('taSelectableElements', ['a', 'img']);

textAngularSetup.value('taCustomRenderers', [
  {
    selector: 'img',
    customAttribute: 'ta-insert-video',
    renderLogic: function(element) {
      var attributes, iframe;
      iframe = angular.element('<iframe></iframe>');
      attributes = element.prop("attributes");
      angular.forEach(attributes, function(attr) {
        return iframe.attr(attr.name, attr.value);
      });
      iframe.attr('src', iframe.attr('ta-insert-video'));
      return element.replaceWith(iframe);
    }
  }
]);

textAngularSetup.constant('taTranslations', {
  toggleHTML: "Toggle HTML",
  insertImage: "Please enter a image URL to insert",
  insertLink: "Please enter a URL to insert",
  insertVideo: "Please enter a youtube URL to embed"
});

textAngularSetup.run([
  'taRegisterTool', '$window', '$document', 'taTranslations', 'taSelection', 'taOptions', 'ImageUploadSvc', 'ResourcesSvc', '$timeout', '$rootScope', '$baseurl', '$ionicModal', '$filter', 'gettext', '$http', function(taRegisterTool, $window, $document, taTranslations, taSelection, taOptions, ImageUploadSvc, ResourcesSvc, $timeout, $scope, $baseurl, $ionicModal, $filter, gettext, $http) {
    var headerAction, imgOnSelectAction, _fileInput, _retActiveStateFunction;
    taRegisterTool("html", {
      buttontext: taTranslations.toggleHTML,
      action: function() {
        return this.$editor().switchView();
      },
      activeState: function() {
        return this.$editor().showHtml;
      }
    });
    _retActiveStateFunction = function(q) {
      return function() {
        return this.$editor().queryFormatBlockState(q);
      };
    };
    headerAction = function() {
      return this.$editor().wrapSelection("formatBlock", "<" + (this.name.toUpperCase()) + ">");
    };
    angular.forEach(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], function(h) {
      return taRegisterTool(h.toLowerCase(), {
        buttontext: h.toUpperCase(),
        action: headerAction,
        activeState: _retActiveStateFunction(h.toLowerCase())
      });
    });
    taRegisterTool('p', {
      buttontext: 'P',
      action: function() {
        return this.$editor().wrapSelection("formatBlock", "<p>");
      },
      activeState: function() {
        return this.$editor().queryFormatBlockState('p');
      }
    });
    taRegisterTool('pre', {
      buttontext: 'pre',
      action: function() {
        return this.$editor().wrapSelection("formatBlock", "<pre>");
      },
      activeState: function() {
        return this.$editor().queryFormatBlockState('pre');
      }
    });
    taRegisterTool('ul', {
      iconclass: 'fa fa-list-ul',
      action: function() {
        return this.$editor().wrapSelection("insertUnorderedList", null);
      },
      activeState: function() {
        return document.queryCommandState('insertUnorderedList');
      }
    });
    taRegisterTool('ol', {
      iconclass: 'fa fa-list-ol',
      action: function() {
        return this.$editor().wrapSelection("insertOrderedList", null);
      },
      activeState: function() {
        return document.queryCommandState('insertOrderedList');
      }
    });
    taRegisterTool('quote', {
      iconclass: 'fa fa-quote-right',
      action: function() {
        return this.$editor().wrapSelection("formatBlock", "<blockquote>");
      },
      activeState: function() {
        return this.$editor().queryFormatBlockState('blockquote');
      }
    });
    taRegisterTool('undo', {
      iconclass: 'fa fa-undo',
      action: function() {
        return this.$editor().wrapSelection("undo", null);
      }
    });
    taRegisterTool('redo', {
      iconclass: 'fa fa-repeat',
      action: function() {
        return this.$editor().wrapSelection("redo", null);
      }
    });
    taRegisterTool('bold', {
      iconclass: 'fa fa-bold',
      action: function() {
        return this.$editor().wrapSelection("bold", null);
      },
      activeState: function() {
        return document.queryCommandState('bold');
      },
      commandKeyCode: 98
    });
    taRegisterTool('justifyLeft', {
      iconclass: 'fa fa-align-left',
      action: function() {
        return this.$editor().wrapSelection("justifyLeft", null);
      },
      activeState: function(commonElement) {
        var result;
        result = false;
        if (commonElement) {
          result = commonElement.css('text-align') === 'left' || commonElement.attr('align') === 'left' || (commonElement.css('text-align') !== 'right' && commonElement.css('text-align') !== 'center' && !document.queryCommandState('justifyRight') && !document.queryCommandState('justifyCenter'));
        }
        result = result || document.queryCommandState('justifyLeft');
        return result;
      }
    });
    taRegisterTool('justifyRight', {
      iconclass: 'fa fa-align-right',
      action: function() {
        return this.$editor().wrapSelection("justifyRight", null);
      },
      activeState: function(commonElement) {
        var result;
        result = false;
        if (commonElement) {
          result = commonElement.css('text-align') === 'right';
        }
        result = result || document.queryCommandState('justifyRight');
        return result;
      }
    });
    taRegisterTool('justifyCenter', {
      iconclass: 'fa fa-align-center',
      action: function() {
        return this.$editor().wrapSelection("justifyCenter", null);
      },
      activeState: function(commonElement) {
        var result;
        result = false;
        if (commonElement) {
          result = commonElement.css('text-align') === 'center';
        }
        result = result || document.queryCommandState('justifyCenter');
        return result;
      }
    });
    taRegisterTool('italics', {
      iconclass: 'fa fa-italic',
      action: function() {
        return this.$editor().wrapSelection("italic", null);
      },
      activeState: function() {
        return document.queryCommandState('italic');
      },
      commandKeyCode: 105
    });
    taRegisterTool('underline', {
      iconclass: 'fa fa-underline',
      action: function() {
        return this.$editor().wrapSelection("underline", null);
      },
      activeState: function() {
        return document.queryCommandState('underline');
      },
      commandKeyCode: 117
    });
    taRegisterTool('clear', {
      iconclass: 'fa fa-ban',
      action: function(deferred, restoreSelection) {
        var $editor, possibleNodes, recursiveRemoveClass, removeListElements;
        this.$editor().wrapSelection("removeFormat", null);
        possibleNodes = angular.element(taSelection.getSelectionElement());
        removeListElements = function(list) {
          var prevElement;
          list = angular.element(list);
          prevElement = list;
          angular.forEach(list.children(), function(liElem) {
            var newElem;
            newElem = angular.element('<p></p>');
            newElem.html(angular.element(liElem).html());
            prevElement.after(newElem);
            return prevElement = newElem;
          });
          return list.remove();
        };
        angular.forEach(possibleNodes.find("ul"), removeListElements);
        angular.forEach(possibleNodes.find("ol"), removeListElements);
        $editor = this.$editor();
        recursiveRemoveClass = function(node) {
          node = angular.element(node);
          if (node[0] !== $editor.displayElements.text[0]) {
            node.removeAttr('class');
          }
          return angular.forEach(node.children(), recursiveRemoveClass);
        };
        angular.forEach(possibleNodes, recursiveRemoveClass);
        if (possibleNodes[0].tagName.toLowerCase() !== 'li' && possibleNodes[0].tagName.toLowerCase() !== 'ol' && possibleNodes[0].tagName.toLowerCase() !== 'ul') {
          this.$editor().wrapSelection("formatBlock", "<p>");
        }
        return restoreSelection();
      }
    });
    imgOnSelectAction = function(event, $element, editorScope) {
      var buttonGroup, container, finishEdit, floatLeft, floatNone, floatRight, fullButton, halfButton, quartButton, remove, resetButton;
      finishEdit = function() {
        editorScope.updateTaBindtaTextElement();
        editorScope.hidePopover();
        return editorScope.displayElements.popoverContainer.empty();
      };
      event.preventDefault();
      editorScope.displayElements.popover.css('width', '100%');
      container = editorScope.displayElements.popoverContainer;
      container.empty();
      buttonGroup = angular.element('<div class="' + taOptions.classes.mediaButtonGroup + '" style="padding-right: 6px;">');
      fullButton = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" unselectable="on" tabindex="-1">100% </button>');
      fullButton.on('click', function(event) {
        event.preventDefault();
        $element.css({
          'width': '100%',
          'height': ''
        });
        return finishEdit();
      });
      halfButton = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" unselectable="on" tabindex="-1">50% </button>');
      halfButton.on('click', function(event) {
        event.preventDefault();
        $element.css({
          'width': '50%',
          'height': ''
        });
        return finishEdit();
      });
      quartButton = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" unselectable="on" tabindex="-1">25% </button>');
      quartButton.on('click', function(event) {
        event.preventDefault();
        $element.css({
          'width': '25%',
          'height': ''
        });
        return finishEdit();
      });
      resetButton = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" unselectable="on" tabindex="-1">Reset</button>');
      resetButton.on('click', function(event) {
        event.preventDefault();
        $element.css({
          width: '',
          height: ''
        });
        return finishEdit();
      });
      buttonGroup.append(fullButton);
      buttonGroup.append(halfButton);
      buttonGroup.append(quartButton);
      buttonGroup.append(resetButton);
      container.append(buttonGroup);
      buttonGroup = angular.element('<div class="' + taOptions.classes.mediaButtonGroup + '" style="padding-right: 6px;">');
      floatLeft = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" unselectable="on" tabindex="-1"><i class="fa fa-align-left"></i></button>');
      floatLeft.on('click', function(event) {
        event.preventDefault();
        $element.css('float', 'left');
        return finishEdit();
      });
      floatRight = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" unselectable="on" tabindex="-1"><i class="fa fa-align-right"></i></button>');
      floatRight.on('click', function(event) {
        event.preventDefault();
        $element.css('float', 'right');
        return finishEdit();
      });
      floatNone = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" unselectable="on" tabindex="-1"><i class="fa fa-align-justify"></i></button>');
      floatNone.on('click', function(event) {
        event.preventDefault();
        $element.css('float', '');
        return finishEdit();
      });
      buttonGroup.append(floatLeft);
      buttonGroup.append(floatNone);
      buttonGroup.append(floatRight);
      container.append(buttonGroup);
      remove = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" unselectable="on" tabindex="-1"><i class="fa fa-trash-o"></i></button>');
      remove.on('click', function(event) {
        var id, src;
        event.preventDefault();
        if (src = $element != null ? $element[0].src : void 0) {
          if (id = src.match(/^http:\/\/.+\/img\/.+\/(.*)$/)[1]) {
            return $scope.destroyMedia('image', id, function(err) {
              if (!err) {
                $element.remove();
              }
              return finishEdit();
            });
          }
        }
      });
      container.append(remove);
      editorScope.showPopover($element);
      return editorScope.showResizeOverlay($element);
    };
    _fileInput = angular.element('<input class="ng-hide" type="file" name="upload" accept="image/gif, image/jpeg, image/png"></input>');
    $document.find('body').append(_fileInput);
    taRegisterTool('insertImage', {
      iconclass: 'fa fa-picture-o',
      action: function(defer) {
        var _this = this;
        ResourcesSvc.$promise.then(function($resources) {
          var _onChange;
          _onChange = function(e) {
            e.stopPropagation();
            _fileInput.unbind('change', _onChange);
            return ImageUploadSvc(e.target.files[0], {
              sizeX: 256
            }).then(function(data) {
              if ($scope.uploadMedia) {
                return $scope.uploadMedia('image', data, function(err, id) {
                  if (id) {
                    _this.$editor().wrapSelection('insertImage', "" + $baseurl + "/img/image/" + id, true);
                  }
                  return defer.resolve();
                });
              } else {
                return defer.resolve();
              }
            }, function(err) {
              return defer.resolve();
            });
          };
          _fileInput.bind('change', _onChange);
          return $timeout(function() {
            return _fileInput[0].click();
          });
        });
        return false;
      },
      onElementSelect: {
        element: 'img',
        action: imgOnSelectAction
      }
    });
    taRegisterTool('insertLink', {
      iconclass: 'fa fa-link',
      action: function() {
        var urlLink;
        urlLink = $window.prompt(taTranslations.insertLink, 'http://');
        if (urlLink && urlLink !== '' && urlLink !== 'http://') {
          return this.$editor().wrapSelection('createLink', urlLink, true);
        }
      },
      activeState: function(commonElement) {
        if (commonElement) {
          return commonElement[0].tagName === 'A';
        } else {
          return false;
        }
      },
      onElementSelect: {
        element: 'a',
        action: function(event, $element, editorScope) {
          var buttonGroup, container, link, reLinkButton, unLinkButton;
          event.preventDefault();
          editorScope.displayElements.popover.css('width', '305px');
          container = editorScope.displayElements.popoverContainer;
          container.empty();
          container.css('line-height', '28px');
          link = angular.element('<a href="' + $element.attr('href') + '" target="_blank">' + $element.attr('href') + '</a>');
          link.css({
            'display': 'inline-block',
            'max-width': '200px',
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
            'vertical-align': 'middle'
          });
          container.append(link);
          buttonGroup = angular.element('<div class="' + taOptions.classes.mediaButtonGroup + ' pull-right">');
          reLinkButton = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" tabindex="-1" unselectable="on"><i class="fa fa-edit icon-edit"></i></button>');
          reLinkButton.on('click', function(event) {
            var urlLink;
            event.preventDefault();
            urlLink = $window.prompt(taTranslations.insertLink, $element.attr('href'));
            if (urlLink && urlLink !== '' && urlLink !== 'http://') {
              $element.attr('href', urlLink);
              editorScope.updateTaBindtaTextElement();
            }
            editorScope.hidePopover();
            return container.empty();
          });
          buttonGroup.append(reLinkButton);
          unLinkButton = angular.element('<button type="button" class="' + taOptions.classes.mediaButton + '" tabindex="-1" unselectable="on"><i class="fa fa-unlink icon-unlink"></i></button>');
          unLinkButton.on('click', function(event) {
            event.preventDefault();
            $element.replaceWith($element.contents());
            editorScope.updateTaBindtaTextElement();
            editorScope.hidePopover();
            return container.empty();
          });
          buttonGroup.append(unLinkButton);
          container.append(buttonGroup);
          return editorScope.showPopover($element);
        }
      }
    });
    return taRegisterTool('insertVideo', {
      iconclass: 'fa fa-youtube-play',
      action: function(defer) {
        var _this = this;
        $http.get('videos').then(function(res) {
          var scope;
          scope = $scope.$new();
          scope.data = {
            list: res.data,
            text: '',
            selected: null
          };
          scope.select = function(video) {
            scope.data.text = video.title;
            return scope.data.selected = video;
          };
          scope.videoFilter = function(video) {
            if (!scope.data.text) {
              return true;
            }
            return new RegExp(scope.data.text, 'i').test(video.title);
          };
          return $ionicModal.fromTemplateUrl('directives/taSetup.tpl', {
            scope: scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            scope.$close = function(val) {
              var embed, srcLink, urlLink, _ref;
              if (val != null ? val.id : void 0) {
                urlLink = "http://player.vimeo.com/video/" + val.id;
                srcLink = ((_ref = val.thumb) != null ? _ref.link : void 0) || '';
                embed = '<img class="ta-insert-video" ta-insert-video="' + urlLink + '" contenteditable="false" src="' + srcLink + '" frameborder="0" allowfullscreen/>';
                _this.$editor().wrapSelection('insertHTML', embed, true);
              }
              return modal.remove().then(function() {
                return defer.resolve();
              });
            };
            return modal.show();
          });
        });
        return false;
      },
      onElementSelect: {
        element: 'img',
        onlyWithAttrs: ['ta-insert-video'],
        action: imgOnSelectAction
      }
    });
  }
]);

textAngularSetup.directive('taInsertVideo', [
  function() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        taInsertVideo: '@'
      },
      template: "<iframe width=\"{{width}}\" frameborder=\"{{frameborder}}\" title=\"{{title}}\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>",
      link: function($scope, $element, $attrs, $ctrl, $transclude) {
        var src;
        src = $element.attr('ta-insert-video');
        $element.removeAttr('ta-insert-video');
        return $element.attr('src', src);
      }
    };
  }
]);

textAngularSetup.directive('taHtmlCompile', [
  '$compile', function($compile) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs, $ctrl, $transclude) {
        $element.html($scope.$eval($attrs.taHtmlCompile));
        return $compile($element.contents())($scope);
      }
    };
  }
]);
