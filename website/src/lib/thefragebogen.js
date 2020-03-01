/*!
thefragebogen
Version: 1.0.0
http://www.TheFragebogen.de
GIT: [object Object]/commit/71aee56165672370ca1b2d54a35cbfabb5f064a9
License: MIT
Sunday, March 1st, 2020, 11:06:08 AM UTC
*/

/**
Defines a message that should be logged, consisting of level, location, and the content.
The messages _should_ be subdivided in five types according to their relevance:
1. Fatal
2. Error
3. Warn
4. Info
5. Debug

DEVELOPER: This class is used internally by LogConsole and should not be accessed directly.

@class LogMessage
*/
class LogMessage {
  /**
    @param {string} logLevel type of message
    @param {string} location location in the code
    @param {string} msg the message itself
    */
  constructor(logLevel, location, msg) {
    this.logLevel = '' + logLevel
    this.location = '' + location
    this.msg = msg
  }
}

/**
Provides basic logging functionality (prints to console).

DEVELOPER: All the messages (instances of class `LogMessage`) are saved in an array and can be accessed via `TheFragebogen.logger.logMessages` as long as this logger is used.

@class LogConsole
*/
class LogConsole {
  constructor() {
    this.logMessages = []
    this.debug('LogConsole.constructor()', 'Start')
  }

  debug(location, msg) {
    this.logMessages.push(new LogMessage('DEBUG', location, msg))
    if (console.debug === undefined) {
      //For IE console.debug is not defined.
      console.debug = console.log
    }
    console.debug('DEBUG: ' + location + ': ' + msg)
  }

  info(location, msg) {
    this.logMessages.push(new LogMessage('INFO', location, msg))
    console.info('INFO: ' + location + ': ' + msg)
  }

  warn(location, msg) {
    this.logMessages.push(new LogMessage('WARN', location, msg))
    console.warn('WARN: ' + location + ': ' + msg)
  }

  error(location, msg) {
    this.logMessages.push(new LogMessage('ERROR', location, msg))
    console.error('ERROR: ' + location + ': ' + msg)
  }

  fatal(location, msg) {
    this.logMessages.push(new LogMessage('FATAL', location, msg))
    console.error('FATAL: ' + location + ': ' + msg)
  }
}

/**
 Defines the accessor for the logger.
 Can be redefined later if desired.
*/
const TheFragebogen = {
  logger: new LogConsole(),
}

/**
Abstract controller class for generic UI elements.
Only provides a set of API that must be implemented by childs.

@abstract
@class UIElement
*/
class UIElement {
  /**
    @param {string} [className] CSS class
    */
  constructor(className) {
    this.className = className

    this.uiCreated = false
    this.enabled = false
    this.visible = true
    this.preloaded = true

    this.preloadedCallback = null
    this.node = null
  }

  /**
    @returns {boolean} true if the UI is created, false if not
    */
  isUIcreated() {
    return this.uiCreated
  }

  /**
    Creates the UI of the element.
    @abstract
    @return {object}
    */
  createUI() {
    TheFragebogen.logger.debug(
      this.constructor.name + '.createUI()',
      'This method must be overridden.'
    )
  }

  /**
    Applies the set className.
    Usually called during createUI().
    @param {string} cssSuffix A suffix to be added to this.className.
    */
  applyCSS(cssSuffix) {
    if (
      this.isUIcreated() &&
      (this.className !== undefined || cssSuffix !== undefined)
    ) {
      let newClassName = ''
      newClassName += this.className !== undefined ? this.className : ''
      newClassName += cssSuffix !== undefined ? cssSuffix : ''
      this.node.className = newClassName
    }
  }

  /**
    Destroys the UI.
    */
  releaseUI() {
    this.uiCreated = false
    this.enabled = false
    this.node = null
  }

  /**
    @return {boolean} Is the UI of this element enabled?
    */
  isEnabled() {
    return this.enabled
  }

  /**
    Setting a component to be enabled incl. UI components.
    By default disables all childs of this.node.
    @param {boolean} enabled
    */
  setEnabled(enable) {
    if (!this.isUIcreated()) {
      return
    }
    this.enabled = enable

    if (this.node !== null) {
      const elements = this.node.getElementsByTagName('*')
      for (let i = 0; i < elements.length; i++) {
        elements[i].disabled = !this.enabled
      }
    }
  }

  /**
    @return {boolean} Is the UI of this element visible?
    */
  isVisible() {
    return this.visible
  }

  /**
    Set UI visible state.
    @param {boolean} visible
    */
  setVisible(visible) {
    if (!this.isUIcreated()) return

    this.visible = visible
    this.node.style.visibility = visible ? 'visible' : 'hidden'
  }

  /**
    @returns {string} The type of this class usually the name of the class.
    */
  getType() {
    return this.constructor.name
  }

  /**
    @abstract
    @return {boolean} Is the element ready?
    */
  isReady() {
    TheFragebogen.logger.debug(
      this.constructor.name + '.isReady()',
      'This method might need to be overridden.'
    )
    return true
  }

  /**
    Starts preloading external media.
    Default implementation immedately sends callback `Screen._sendOnScreenPreloadedCallback()`.
    @abstract
    */
  preload() {
    TheFragebogen.logger.debug(
      this.constructor.name + '.preload()',
      'Must be overridden for preloading.'
    )
    this._sendOnPreloadedCallback()
  }

  /**
    All external resources loaded?
    @returns {boolean}
    */
  isPreloaded() {
    return this.preloaded
  }

  /**
    Set callback to get informed when loading of all required external data is finished.
    @param {Function}
    @return {boolean}
    */
  setOnPreloadedCallback(preloadedCallback) {
    if (!(preloadedCallback instanceof Function)) {
      TheFragebogen.logger.error(
        this.constructor.name + '.setOnPreloadedCallback()',
        'No callback handle given.'
      )
      return false
    }

    TheFragebogen.logger.debug(
      this.constructor.name + '.setOnPreloadedCallback()',
      'called'
    )
    this.preloadedCallback = preloadedCallback
    return true
  }

  /**
    Sends this.onPreloadCallback() to signalize that all required data could be loaded.
    @return {boolean}
    */
  _sendOnPreloadedCallback() {
    if (!(this.preloadedCallback instanceof Function)) {
      TheFragebogen.logger.warn(
        this.constructor.name + '._sendOnPreloadedCallback()',
        'called, but no onScreenPreloadedCallback set.'
      )
      return false
    }
    this.preloaded = true
    this.preloadedCallback()
  }

  /**
    @abstract
    @return {string} Returns a string representation of this object.
    */
  toString() {
    TheFragebogen.logger.debug(
      this.constructor.name + '.toString()',
      'This method might need to be overridden.'
    )
  }
}

/**
A UIElement that has an interactive UI and thus might not be ready in the beginning but requiring user interaction before its goal is fulfilled.

@abstract
@class UIElementInteractive
@augments UIElement
*/
class UIElementInteractive extends UIElement {
  /**
    @param {string} [className] CSS class
    */
  constructor(className) {
    super(className)
    this.enabled = false
    this.onReadyStateChanged = null
  }

  setOnReadyStateChangedCallback(onReadyStateChanged) {
    if (onReadyStateChanged instanceof Function) {
      TheFragebogen.logger.debug(
        this.constructor.name + '.setOnReadyStateChangedCallback()',
        'called'
      )
      this.onReadyStateChanged = onReadyStateChanged
    } else {
      this.onReadyStateChanged = null
    }
  }

  _sendReadyStateChanged() {
    if (this.onReadyStateChanged instanceof Function) {
      TheFragebogen.logger.debug(
        this.constructor.name + '._sendReadyStateChanged()',
        'called'
      )
      this.onReadyStateChanged(this)
    }
  }

  /**
    Updates the UI to inform to reflect that this element is _yet_ not ready.
    @abstract
    */
  markRequired() {
    TheFragebogen.logger.debug(
      this.constructor.name + '.markRequired()',
      'This method should be overridden.'
    )
  }
}

/**
A QuestionnaireItem is an abstract UIElementInteractive that consists of a question and presents a scale.
The answer on the scale is stored.

NOTE: An QuestionnaireItem that is not yet answered but required, will be marked on check with the CSS class: `className + "Required"`.

DEVERLOPER: Subclasses need to override `_createAnswerNode()`.

@abstract
@class QuestionnaireItem
@augments UIElement
@augments UIElementInteractive
*/
class QuestionnaireItem extends UIElementInteractive {
  /**
    @param {string} [className] CSS class
    @param {string} question question
    @param {boolean} [required=false] Is this QuestionnaireItem required to be answered?
    */
  constructor(className, question, required) {
    super(className)

    this.question = question
    this.required = required
    this.answerLog = [] //will store [[Date, answer]...]

    TheFragebogen.logger.debug(
      this.constructor.name + '()',
      'Set: className as ' +
        this.className +
        ', question as ' +
        this.question +
        ' and required as ' +
        this.required
    )
  }

  /**
    Returns the question.
    @returns {string} The question.
    */
  getQuestion() {
    return this.question
  }

  /**
    Returns the answer (most recent set).
    @returns {object} The answer.
    */
  getAnswer() {
    if (this.answerLog.length === 0) {
      return null
    }
    return this.answerLog[this.answerLog.length - 1][1]
  }

  /**
    Returns a copy of the changelog of answers (as generated by `this.setAnswer()`).
    @returns {array<Date, object>} The changelog of answers.
    */
  getAnswerChangelog() {
    return this.answerLog.slice()
  }

  /**
    Sets the answer and adds it to this.answerLog.
    @param {object} answer The answer to be set.
    @returns {boolean} Success or failure.
    */
  setAnswer(answer) {
    this.answerLog.push([new Date(), answer])
    this._sendReadyStateChanged()
    return true
  }

  /**
    Is this QuestionnaireItem answered?
    @returns {boolean}
    */
  isAnswered() {
    return (
      this.answerLog.length > 0 &&
      this.answerLog[this.answerLog.length - 1][1] !== null
    )
  }

  /**
    Returns the list of predefined options.
    @abstract
    @returns {array} undefined by default.
    */
  getAnswerOptions() {
    return undefined
  }

  /**
    Adjust the UI if the answer was changed using `setAnswer()`.
    @abstract
    */
  applyAnswerToUI() {
    TheFragebogen.logger.debug(
      this.constructor.name + '.applyAnswerToUI()',
      'This method might need to be overridden.'
    )
  }

  /**
    Is this QuestionnaireItem ready, i.e., answered if required?
    @returns {boolean}
    */
  isReady() {
    return this.isRequired() ? this.isAnswered() : true
  }

  /**
    Is this QuestionnaireItem required to be answered?
    @returns {boolean}
    */
  isRequired() {
    return this.required
  }

  createUI() {
    this.uiCreated = true

    this.node = document.createElement('div')
    this.applyCSS()

    this.node.appendChild(this._createQuestionNode())
    this.node.appendChild(this._createAnswerNode())

    this.applyAnswerToUI()

    return this.node
  }

  /**
    Create the UI showing the question.
    @returns {HTMLElement} The div containing the question.
    */
  _createQuestionNode() {
    const questionNode = document.createElement('div')
    questionNode.innerHTML = this.question + (this.required ? '*' : '')
    return questionNode
  }

  /**
    Create the UI showing the scale.
    @abstract
    @returns {HTMLElement} The HTML container with the scale.
    */
  _createAnswerNode() {
    TheFragebogen.logger.warn(
      this.constructor.name + '._createAnswerNode()',
      'This method might need to be overridden.'
    )
  }

  releaseUI() {
    super.releaseUI()
  }

  /**
    Mark this element as required if it was not answered (className + "Required").
    Is called by the Screen if necessary.
    */
  markRequired() {
    if (this.node === null) {
      return
    }

    const classNameRequired =
      (this.className !== undefined ? this.className : '') + 'Required'
    if (!this.isReady()) {
      this.node.classList.add(classNameRequired)
    } else {
      this.node.classList.remove(classNameRequired)
    }
  }
}

/**
A base class for QuestionnaireItems using a SVG as scale.

The SVG is required to have click-positions representing the potential answers (e.g., path, rect, ellipse).
Actionlistener are added to these while the id of each answer-element represents the _answer_.
In addition, the SVG must contain an element `id="cross"` that shows the current answer (if set).

DEVELOPER:
To implement a new scale:
1. Create an SVG
1.1. Add a id=cross
1.2. Add click-position with _unique_ id (Non-unique ids also work, but setAnswer() will misbehave).
2. Override _setupSVG(): Set up the SVG and viewbox.
3. Override _getAnswerElements()
4. Override getAnswerOptions

ATTENTION:
Creating the SVG is not straight forward as the cross-element is moved to an answer using transform.
We had some trouble, if each answer-element had an individual transform (e.g., matrix) instead of an absolute position.

[Inkscape](http://inkscape.org) might add those transform if copy-and-paste is used.
To remove those transforms group and ungroup all answer-elements in Inkscape.

To test your SVG, you can use the following code (open the SVG in Chrome and open developer mode).
The cross should be positioned accordingly.

<code>
const cross=document.getElementById("cross")
const answerA = document.getElementById('10'); //Change if you use different answer

cross.setAttributeNS(null, "transform", "translate(0,0)"); //Reset cross position

transform = cross.getTransformToElement(answerA)
crossBB = cross.getBBox()
answerABB = answerA.getBBox()
cross.setAttributeNS(null, "transform", "translate(" + (-transform.e + Math.abs(answerABB.x - crossBB.x) - crossBB.width/2 + answerABB.width/2) + ",0)");
</code>

@class QuestionnaireItemSVG
@augments UIElement
@augments UIElementInteractive
@augments QuestionnaireItem
*/
class QuestionnaireItemSVG extends QuestionnaireItem {
  /**
    @param {string} [className] CSS class
    @param {string} question
    @param {boolean} [required=false]
    */
  constructor(className, question, required) {
    super(className, question, required)

    this.scaleImage = null
    this.answerMap = {}
    this.crossImage = null
  }

  _createAnswerNode() {
    const answerNode = document.createElement('div')

    this.scaleImage = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    this._setupSVG()

    this.crossImage = this.scaleImage.getElementById('cross')
    //Problem identified here by the tests while using Safari 7.0.6 --- this.crossImage === null
    if (this.crossImage === null) {
      answerNode.innerHTML =
        '"QuestionnaireItemSVG" feature not available in this browser or SVG is not compatible.'
      this.setAnswer('Browser did not support SVG.')
      return answerNode
    }

    this.crossImage.setAttributeNS(null, 'opacity', 0)

    //Attach event listener to clickable areas.
    const answerElements = this._getAnswerElements()

    for (let i = 0; i < answerElements.length; i++) {
      if (answerElements[i].id === 'cross') {
        continue
      }

      this.answerMap[answerElements[i].id] = answerElements[i]
      answerElements[i].addEventListener('click', event => {
        this.setAnswer(event.target.id)
        this.applyAnswerToUI()
      })
    }

    answerNode.appendChild(this.scaleImage)
    return answerNode
  }

  /**
    Setup this.scaleImage by definining the content and the viewbox.
    1. this.scaleImage.innerHTML = "<svg...>";
    2. this.scaleImage.setAttribute("viewBox", "0 2 136.76 21.39");
    */
  _setupSVG() {
    TheFragebogen.logger.error(
      this.constructor.name + '._setupSVG()',
      'Must be overridden.'
    )
  }

  /**
    Returns all clickable elements representing an answer.
    Every element must have a unique id, which is used as answer.
    @returns {array}
    */
  _getAnswerElements() {
    TheFragebogen.logger.error(
      this.constructor.name + '._answerElements()',
      'Must be overridden.'
    )
    return []
  }

  applyAnswerToUI() {
    if (!this.isUIcreated()) {
      return
    }

    if (this.getAnswer() === null) {
      this.crossImage.setAttributeNS(null, 'opacity', 0)
      return
    }
    if (this.answerMap[this.getAnswer()] === undefined) {
      TheFragebogen.logger.error(
        this.constructor.name + '.applyAnswerToUI()',
        'Invalid answer provided: ' + this.getAnswer()
      )
      return
    }

    //Displays cross
    this.crossImage.setAttributeNS(null, 'opacity', 1)

    //Reset previous transforms.
    this.crossImage.setAttributeNS(null, 'transform', 'translate(0,0)')

    //Move to new position.
    const answer = this.answerMap[this.getAnswer()]
    const crossBBox = this.crossImage.getBBox()
    const answerBBox = answer.getBBox()

    const transform = answer
      .getScreenCTM()
      .inverse()
      .multiply(this.crossImage.getScreenCTM())
    const translateX =
      -transform.e +
      Math.abs(answerBBox.x - crossBBox.x) -
      crossBBox.width / 2 +
      answerBBox.width / 2

    TheFragebogen.logger.debug(
      this.constructor.name + '.applyAnswerToUI()',
      translateX
    )
    this.crossImage.setAttributeNS(
      null,
      'transform',
      'translate(' + translateX + ',0)'
    )
  }

  releaseUI() {
    super.releaseUI()

    this.scaleImage = null
    this.answerMap = {}
    this.crossImage = null
  }

  getAnswerOptions() {
    TheFragebogen.logger.warn(
      this.constructor.name + '.getAnswerOptions()',
      'Should be overriden.'
    )
    return super.getAnswerOptions()
  }
}

/**
A QuestionnaireItem presenting the 7pt Quality scale as defined in ITU-T P.851 p. 19.
Labels are by default in German - the content of the labels is defined in the SVG.

@class QuestionnaireItemSVGQuality7pt
@augments UIElement
@augments UIElementInteractive
@augments QuestionnaireItem
@augments QuestionnaireItemSVG
*/
export class QuestionnaireItemSVGQuality7pt extends QuestionnaireItemSVG {
  /**
    @param {string} [className] CSS class
    @param {string} question
    @param {boolean} [required=false]
    @param {string[]} [labels=["NOTE: Default labels are defined in the SVG."]] The labels (7 items; evaluated to string)
    */
  constructor(className, question, required, labels) {
    super(className, question, required)

    this.labels = labels
  }

  _setupSVG() {
    this.scaleImage = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    )
    this.scaleImage.setAttribute('viewBox', '0 2 136.76 21.39')
    this.scaleImage.innerHTML =
      '<?xml version="1.0" encoding="utf-8" standalone="no"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" id="svg5198" height="21.394005" width="136.76094"><defs id="defs5200" /><metadata id="metadata5203"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title /></cc:Work></rdf:RDF></metadata><g style="display:inline" transform="translate(-12.104855,-1030.0402)" id="layer1"><rect y="1036.3621" x="30" height="1" width="103" id="rect5206" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="25" height="2.0999999" width="1.000026" id="rect5763" style="opacity:0;fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="29.000103" height="2.0999999" width="1.000026" id="rect5765" style="opacity:0;fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="33.000206" height="2.0999999" width="1.000026" id="rect5765-9" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="36.999847" height="2.0999999" width="1" id="rect5765-9-4" style="fill:#000000;fill-opacity:1" /><rect y="1037.3622" x="40.799999" height="5" width="1.2" id="rect5822" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="45" height="2.0999999" width="1.000026" id="rect5763-5" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="49.000103" height="2.0999999" width="1.000026" id="rect5765-7" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="53.000206" height="2.0999999" width="1.000026" id="rect5765-9-9" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="56.999847" height="2.0999999" width="1" id="rect5765-9-4-2" style="fill:#000000;fill-opacity:1" /><rect y="1037.3622" x="60.799999" height="5" width="1.2" id="rect5822-6" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="65" height="2.0999999" width="1.000026" id="rect5763-5-2" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="69.000107" height="2.0999999" width="1.000026" id="rect5765-7-5" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="73.000206" height="2.0999999" width="1.000026" id="rect5765-9-9-0" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="76.999847" height="2.0999999" width="1" id="rect5765-9-4-2-3" style="fill:#000000;fill-opacity:1" /><rect y="1037.3622" x="80.800003" height="5" width="1.2" id="rect5822-6-5" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="85.000008" height="2.0999999" width="1.000026" id="rect5763-5-2-9" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="89.000114" height="2.0999999" width="1.000026" id="rect5765-7-5-9" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="93.000214" height="2.0999999" width="1.000026" id="rect5765-9-9-0-0" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="96.999855" height="2.0999999" width="1" id="rect5765-9-4-2-3-5" style="fill:#000000;fill-opacity:1" /><rect y="1037.3622" x="100.8" height="5" width="1.2" id="rect5822-6-5-4" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="105.00002" height="2.0999999" width="1.000026" id="rect5763-5-2-9-6" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="109.00013" height="2.0999999" width="1.000026" id="rect5765-7-5-9-9" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="113.00023" height="2.0999999" width="1.000026" id="rect5765-9-9-0-0-8" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="116.99986" height="2.0999999" width="1" id="rect5765-9-4-2-3-5-0" style="fill:#000000;fill-opacity:1" /><rect y="1037.3622" x="120.8" height="5" width="1.2" id="rect5822-6-5-4-7" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="125.00002" height="2.0999999" width="1.000026" id="rect5763-5-2-9-6-9" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="129.00012" height="2.0999999" width="1.000026" id="rect5765-7-5-9-9-9" style="fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="133.00023" height="2.0999999" width="1.000026" id="rect5765-9-9-0-0-8-0" style="opacity:0;fill:#000000;fill-opacity:1" /><rect y="1037.2622" x="136.99986" height="2.0999999" width="1" id="rect5765-9-4-2-3-5-0-5" style="opacity:0;fill:#000000;fill-opacity:1" /><rect y="1036.6622" x="21.204855" height="0.40000001" width="8.8000002" id="rect6036" style="fill:#000000;fill-opacity:1" /><rect y="1036.9623" x="21.206226" height="5.4000001" width="0.3491767" id="rect6036-5" style="fill:#000000;fill-opacity:1" /><rect transform="scale(-1,1)" y="1036.6621" x="-141.80486" height="0.40000001" width="8.8000002" id="rect6036-2" style="fill:#000000;fill-opacity:1" /><rect transform="scale(-1,1)" y="1036.9622" x="-141.80486" height="5.4000001" width="0.40000001" id="rect6036-5-2" style="fill:#000000;fill-opacity:1" /><text id="label10" y="1044.4059" x="21.174191" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:2px;line-height:100%;font-family:Sans;-inkscape-font-specification:Sans;text-align:center;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;fill:#000000;fill-opacity:1;stroke:none" xml:space="preserve"><tspan y="1044.4059" x="21.174191" id="tspan3851">extrem</tspan><tspan id="tspan3853" y="1046.4059" x="21.174191">schlecht</tspan></text><text id="label20" y="1044.5059" x="41.174191" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:2px;line-height:100%;font-family:Sans;-inkscape-font-specification:Sans;text-align:center;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;display:inline;fill:#000000;fill-opacity:1;stroke:none" xml:space="preserve"><tspan id="tspan3853-8" y="1044.5059" x="41.174191">schlecht</tspan></text><text id="label30" y="1044.6182" x="61.267941" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:2px;line-height:100%;font-family:Sans;-inkscape-font-specification:Sans;text-align:center;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;display:inline;fill:#000000;fill-opacity:1;stroke:none" xml:space="preserve"><tspan id="tspan3853-8-1" y="1044.6182" x="61.267941">dürftig</tspan></text><text id="label40" y="1044.6058" x="81.267944" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:2px;line-height:100%;font-family:Sans;-inkscape-font-specification:Sans;text-align:center;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;display:inline;fill:#000000;fill-opacity:1;stroke:none" xml:space="preserve"><tspan x="81.267944" id="tspan3853-8-1-6" y="1044.6058">ordentlich</tspan></text><text id="label50" y="1044.4182" x="101.4683" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:2px;line-height:100%;font-family:Sans;-inkscape-font-specification:Sans;text-align:center;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;display:inline;fill:#000000;fill-opacity:1;stroke:none" xml:space="preserve"><tspan id="tspan3853-8-1-6-0" y="1044.4182" x="101.4683">gut</tspan></text><text id="label60" y="1044.5182" x="121.25037" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:2px;line-height:100%;font-family:Sans;-inkscape-font-specification:Sans;text-align:center;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;display:inline;fill:#000000;fill-opacity:1;stroke:none" xml:space="preserve"><tspan id="tspan3853-8-1-6-04" y="1044.5182" x="121.25037">ausgezeichnet</tspan></text><text id="label70" y="1044.5059" x="141.63435" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:2px;line-height:100%;font-family:Sans;-inkscape-font-specification:Sans;text-align:center;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;display:inline;fill:#000000;fill-opacity:1;stroke:none" xml:space="preserve"><tspan id="tspan3853-8-1-6-04-3" y="1044.5059" x="141.63435">ideal</tspan></text><text id="text4253" y="1060.8917" x="39.858795" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:8px;line-height:125%;font-family:Arial;-inkscape-font-specification:"Arial, Normal";text-align:center;letter-spacing:0px;word-spacing:0px;writing-mode:lr-tb;text-anchor:middle;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" xml:space="preserve"><tspan y="1060.8917" x="39.858795" id="tspan4255" /></text></g><g style="display:inline" transform="translate(7.8951471,6.3219508)" id="layer3"><ellipse id="12" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="5.4548545" cy="1.5720948" rx="1" ry="2.5" /><ellipse id="13" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="7.5048547" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="14" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="9.5048542" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="15" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="11.504855" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="16" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="13.504855" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="17" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="15.504855" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="18" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="17.504854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="19" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="19.504854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="20" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="21.404854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="22" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="25.454855" cy="1.5720948" rx="1" ry="2.5" /><ellipse id="23" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="27.504854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="24" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="29.504854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="25" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="31.504854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="26" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="33.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="27" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="35.504856" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="28" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="37.504856" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="29" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="39.504856" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="30" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="41.404854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="21" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="23.354855" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="32" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="45.454853" cy="1.5720948" rx="1" ry="2.5" /><ellipse id="33" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="47.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="34" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="49.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="35" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="51.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="36" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="53.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="37" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="55.504856" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="38" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="57.504856" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="39" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="59.504856" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="40" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="61.404854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="31" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="43.354855" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="42" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="65.454857" cy="1.5720948" rx="1" ry="2.5" /><ellipse id="43" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="67.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="44" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="69.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="45" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="71.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="46" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="73.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="47" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="75.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="48" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="77.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="49" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="79.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="50" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="81.404854" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="41" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="63.354855" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="52" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="85.454857" cy="1.5720948" rx="1" ry="2.5" /><ellipse id="53" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="87.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="54" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="89.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="55" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="91.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="56" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="93.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="57" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="95.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="58" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="97.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="59" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="99.504852" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="60" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="101.40485" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="51" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="83.354858" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="62" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="105.50486" cy="1.5720948" rx="1" ry="2.5" /><ellipse id="63" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="107.55486" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="64" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="109.55486" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="65" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="111.55486" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="66" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="113.55486" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="67" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="115.55486" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="68" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="117.55486" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="69" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="119.55486" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="70" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="121.55486" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="61" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="103.40485" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="11" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="3.4048545" cy="1.5720948" rx="0.94999999" ry="2.5" /><ellipse id="10" style="opacity:0;fill:#000000;fill-opacity:0.45871558" cx="1.4048545" cy="1.5720948" rx="0.94999999" ry="2.5" /></g><g transform="translate(7.0000016,5.4565456)" style="display:inline" id="layer4"><path id="cross" d="M 3.666497,-0.09404561 C 0.69774682,2.8434544 0.69774682,2.8434544 0.69774682,2.8434544 L 2.2289971,1.3747044 0.72899682,-0.15654561 3.697747,2.8434544" style="fill:none;stroke:#000000;stroke-width:0.60000002;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none" /></g></svg>'

    if (this.labels instanceof Array && this.labels.length === 7) {
      TheFragebogen.logger.debug(
        this.constructor.name + '._setupSVG()',
        'Using custom labels: ' + this.labels
      )

      this.scaleImage.getElementById('label10').textContent = this.labels[0]
      this.scaleImage.getElementById('label20').textContent = this.labels[1]
      this.scaleImage.getElementById('label30').textContent = this.labels[2]
      this.scaleImage.getElementById('label40').textContent = this.labels[3]
      this.scaleImage.getElementById('label50').textContent = this.labels[4]
      this.scaleImage.getElementById('label60').textContent = this.labels[5]
      this.scaleImage.getElementById('label70').textContent = this.labels[6]
    } else {
      TheFragebogen.logger.info(
        this.constructor.name + '._setupSVG()',
        'Using default scale labels.'
      )
    }
  }

  _getAnswerElements() {
    return this.scaleImage.getElementsByTagName('ellipse')
  }

  getAnswerOptions() {
    return '10-70'
  }
}
