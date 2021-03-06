'use strict';

import React from 'react';
import classnames from 'classnames';

var getSlideClasses = (spec) => {
  var slickActive, slickCenter, slickCloned;
  var centerOffset, index;

  if (spec.rtl) {
    index = spec.slideCount - 1 - spec.index;
  } else {
    index = spec.index;
  }

  slickCloned = (index < 0) || (index >= spec.slideCount);
  if (spec.centerMode) {
    centerOffset = Math.floor(spec.slidesToShow / 2);
    slickCenter = (index - spec.currentSlide) % spec.slideCount === 0;
    if ((index > spec.currentSlide - centerOffset - 1) && (index <= spec.currentSlide + centerOffset)) {
      slickActive = true;
    }
  } else {
    slickActive = (spec.currentSlide <= index) && (index < spec.currentSlide + spec.slidesToShow);
  }
  return classnames({
    'slick-slide': true,
    'slick-active': slickActive,
    'slick-center': slickCenter,
    'slick-cloned': slickCloned
  });
};

var getSlideStyle = function (spec) {
  var style = {};

  if (spec.variableWidth === undefined || spec.variableWidth === false) {
    style.width = spec.slideWidth || '100%';
  }

  if (spec.fade) {
    style.position = 'relative';
    style.left = -spec.index * spec.slideWidth;
    style.opacity = (spec.currentSlide === spec.index) ? 1 : 0;
    style.transition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase;
    style.WebkitTransition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase;
  }

  return style;
};

var getKey = (child, fallbackKey) => {
    // key could be a zero
    return (child.key === null || child.key === undefined) ? fallbackKey : child.key;
};

function renderSlides(spec) {
  var key;
  var slides = [];
  var preCloneSlides = [];
  var postCloneSlides = [];
  var count = React.Children.count(spec.children);
  var child;

  React.Children.forEach(spec.children, (elem, index) => {
    if (!spec.lazyLoad | (spec.lazyLoad && spec.lazyLoadedList.indexOf(index) >= 0)) {
      child = elem;
    } else {
      child = (<div></div>);
    }
    var childStyle = getSlideStyle(Object.assign({}, spec, {index: index}));
    var slickClasses = getSlideClasses(Object.assign({index: index}, spec));
    var cssClasses;

    //console.log('xxxxx renderSlides', childStyle);

    if (child.props.className) {
        cssClasses = classnames(slickClasses, child.props.className);
    } else {
        cssClasses = slickClasses;
    }

    slides.push(
      <div
        key={'original' + getKey(child, index)}
        data-index={index}
        className={cssClasses}
        style={childStyle}>
        {this._renderSlideChild(child)}
      </div>
    );

    // variableWidth doesn't wrap properly.
    if (spec.infinite && spec.fade === false) {
      var infiniteCount = spec.variableWidth ? spec.slidesToShow + 1 : spec.slidesToShow;

      if (index >= (count - infiniteCount)) {
        key = -(count - index);
        preCloneSlides.push(
          <div
            key={'precloned' + getKey(child, index)}
            data-index={index}
            className={cssClasses}
            style={childStyle}>
            {this._renderSlideChild(child)}
          </div>
        );
      }

      if (index < infiniteCount) {
        postCloneSlides.push(
          <div
            key={'postcloned' + getKey(child, index)}
            data-index={index}
            className={cssClasses}
            style={childStyle}>
            {this._renderSlideChild(child)}
          </div>
        );
      }
    }
  });

  if (spec.rtl) {
    return preCloneSlides.concat(slides, postCloneSlides).reverse();
  } else {
    return preCloneSlides.concat(slides, postCloneSlides);
  }

}

export var Track = React.createClass({
  _renderSlideChild(child) {
    return React.cloneElement(child);
  },
  renderSlides,
  render: function () {
    var slides = this.renderSlides(this.props);
    return (
      <div className='slick-track' style={this.props.trackStyle}>
        { slides }
      </div>
    );
  }
});
