// https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-select-only.html

import { Component, Host, h, Element, State, Listen, Prop, Watch } from '@stencil/core';
export interface ComboboxSelectOnlyOption {
  label: string;
  value: string | boolean;
}

/**
 * @Name Accessible combobox select-only
 * @Description Accessible combobox select-only
 * @slot default - Label Content
 */
@Component({
  tag: 'combobox-select-only',
  styleUrl: 'combobox-select-only.scss',
  // Allow components to be scoped or set to false to allow global styles to apply.
  shadow: true,
})

// This default export determines where your story goes in the story list
export class ComboboxSelectOnly {
  /**
   * 1. Own Properties
   * Always set the type if a default value has not
   * been set. If a default value is being set, then type
   * is already inferred. List the own properties in
   * alphabetical order. Note that because these properties
   * do not have the @Prop() decorator, they will not be exposed
   * publicly on the host element, but only used internally.
   */

  /**
   * 2. Reference to host HTML element.
   * Inlined decorator
   */
  @Element() el: HTMLElement;
  toggleEl: any;
  suggestionBox: any;
  wrapperElement: HTMLDivElement;
  focusedIndex: any;
  selectedItems: any[];

  /**
  * @ControlType object
  * @Type Array<ComboboxSelectOnlyOption>
  * @Description Options array for the component
  * @Required true
  * @Example [
      { "label": "Europe", "value": "Europe" },
      { "label": "Asia", "value": "Asia" },
      { "label": "Africa", "value": "Africa" },
      { "label": "Australia", "value": "Australia" },
      { "label": "North America", "value": "North America" },
      { "label": "South America", "value": "South America" }
    ]
  */
  @Prop() options: Array<ComboboxSelectOnlyOption> | string;
  private _options: Array<ComboboxSelectOnlyOption>;

  /**
   * @Example No options selected
   */
  @Prop() placeholder: string = 'Select a colour';

  /**
   * 3. State() variables
   * Inlined decorator, alphabetical order.
   */
  // @State() isValidated: boolean;
  @State() isToggled: boolean;
  @State() isSelected: boolean;
  /**
   * 4. Internal props (context and connect)
   * Inlined decorator, alphabetical order.
   */
  // @Prop({ context: 'config' }) config: Config;

  // input value
  @Prop() value: string | number | boolean;

  /**
   * 5. Public Property API
   * Inlined decorator, alphabetical order. These are
   * different than "own properties" in that public props
   * are exposed as properties and attributes on the host element.
   * Requires JSDocs for public API documentation.
   */
  //  @Prop() content: string;

  /**
   * NOTE: Prop lifecycle events SHOULD go just behind the Prop they listen to.
   * This makes sense since both statements are strongly connected.
   * - If renaming the instance variable name you must also update the name in @Watch()
   * - Code is easier to follow and maintain.
   */
  //  @Prop() swipeEnabled = true;

  // parse stencil props
  parseProps(newValue: any) {
    if (typeof newValue == 'object') {
      return newValue;
    } else if (typeof (newValue == 'string')) {
      return JSON.parse(newValue);
    }
  }

  @Watch('options')
  parsePropsOptions(options: Array<ComboboxSelectOnlyOption> | string) {
    if (options) {
      this._options = this.parseProps(options);
    } else {
      this._options = null;
    }
  }

  /**
   * 6. Events section
   * Inlined decorator, alphabetical order.
   * Requires JSDocs for public API documentation.
   */
  //  @Event() ionClose: EventEmitter;

  /**
   * 7. Component lifecycle events
   * Ordered by their natural call order, for example
   * WillLoad should go before DidLoad.
   */
  componentWillLoad() {
    this.parsePropsOptions(this.options);
  }

  // Called once just after the component is fully loaded and the first render() occurs.
  componentDidLoad(): void {
    this.toggleEl = this.el.shadowRoot.querySelector('.combobox');
    this.suggestionBox = this.el.shadowRoot.querySelector('.combobox__list');
    this.wrapperElement = this.el.shadowRoot.querySelector('.dropdown-wrapper');
    this.focusedIndex = null;
    this.selectedItems = [];
  }

  /**
   * 8. Listeners
   * It is ok to place them in a different location
   * if makes more sense in the context. Recommend
   * starting a listener method with "on".
   * Always use two lines.
   */
  @Listen('click', { target: 'body' })
  checkForClickOutside(ev: { target: Node }) {
    if (this.el.contains(ev.target)) {
      // If click was inside the current component, stop here
      return;
    }
    // If the click was outside the current component, do the following
    this.suggestionBoxVisible(false);
  }

  /**
   * 9. Public methods API
   * These methods are exposed on the host element.
   * Always use two lines.
   * Requires JSDocs for public API documentation.
   */

  /* =================== EVENT HANDLING =================== */
  // Event handling for keydown events for the suggestion box

  keyDownSuggestionBox(e: KeyboardEvent) {
    let key = e.key;

    // ESC closes the suggestion box
    if (key === 'Escape') {
      this.suggestionBoxVisible(false);
      this.toggleEl.focus();
      return;
    }

    // Down moves to the next option
    else if (key === 'ArrowDown') {
      e.preventDefault();
      this.mockListFocus('DWN');
      return;
    }
    // Up moves to the previous option
    else if (key === 'ArrowUp') {
      e.preventDefault();
      this.mockListFocus('UP');
      return;
    }

    // Tab closes the suggestion box (similar to blur)
    else if (key === 'Tab') {
      this.suggestionBoxVisible(false);
    }

    // Enter selects the focused item
    else if (key === 'Enter' && this.focusedIndex != null) {
      this.selectItem(this.focusedIndex);
      return;
    }

    // Space selects the focused item
    // Older browsers may return "Spacebar" instead of " " for the Space Bar key. Firefox did so until version 37, as did Internet Explorer 9, 10, and 11.
    // https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
    else if (key === ' ' && this.focusedIndex != null) {
      e.preventDefault();
      this.selectItem(this.focusedIndex);
      return;
    }
  }

  // Event handling for keydown events for the toggle button
  keyDownButton(e: KeyboardEvent) {
    let key = e.key;

    // Down opens the suggestion box and selects the first value
    if (key === 'ArrowDown') {
      e.preventDefault();
      this.suggestionBoxVisible(true);
      this.mockListFocus('DWN');
      return;
    }

    // Up opens the suggestion box and selects the last value
    if (key === 'ArrowUp') {
      e.preventDefault();
      this.suggestionBoxVisible(true);
      this.mockListFocus('UP');
      return;
    }

    // Enter or Space opens the suggestion box and selects the first value
    else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      this.suggestionBoxVisible(true);
      return;
    }
  }

  // Event handling for opening and closing the suggestion box with mouse
  mouseClickButton() {
    let classes = Array.from(this.suggestionBox.classList);
    if (classes.includes('hidden')) {
      this.suggestionBoxVisible(true);
      this.mockListFocus('DWN');
      this.isToggled = !this.isToggled;
    } else {
      this.suggestionBoxVisible(false);
    }
  }

  // Event handling for selecting an item with mouse
  mouseClickSuggestionBox(e: Event) {
    const target = e.target as HTMLUListElement;
    if (target.nodeName === 'LI') {
      let id = target.id.split('-')[1];
      this.selectItem(id);
    }
  }

  /* =================== FUNCTIONALITY =================== */

  /* Displays or hides the suggestion box based on the given boolean parameter
  / visible == true -> make the box visible, visible == false -> hide the box
  / Does not toggle between the two states even if called multiple times in a row!*/
  suggestionBoxVisible(visible: boolean) {
    let classes = Array.from(this.suggestionBox.classList);
    // Making visible
    if (visible && classes.includes('hidden')) {
      this.suggestionBox.classList.toggle('hidden');
      this.toggleEl.setAttribute('aria-expanded', 'true');
      this.suggestionBox.focus();
    }
    // Hiding
    else if (!visible && !classes.includes('hidden')) {
      this.suggestionBox.classList.toggle('hidden');
      this.toggleEl.setAttribute('aria-expanded', 'false');
      this.focusedIndex = null;
      this.clearFocusStyles(this.suggestionBox.children);
      this.suggestionBox.setAttribute('aria-activedescendant', '');
    }
  }

  // Toggle suggestion box visibility on/off by calling the suggestionBoxVisible()
  suggestionBoxToggle() {
    this.suggestionBoxVisible(Array.from(this.suggestionBox.classList).includes('hidden'));
  }

  /* Mocked focus for suggestions (as they are not traditionally focusable)
  / The parameter string direction defines if the focus should move up or down in the list.
  / direction == 'DWN' or direction == 'UP'
  / If the end of list is reached, return to the beginning and the other way around.*/
  mockListFocus(direction: string) {
    let listLength = this.suggestionBox.children.length;
    if (direction == 'DWN') {
      if (this.focusedIndex == null) {
        this.focusedIndex = 0;
      } else if (this.focusedIndex < listLength - 1) {
        this.focusedIndex += 1;
      } else if (this.focusedIndex >= listLength - 1) {
        this.focusedIndex = 0;
      }
    }
    // direction = UP
    else if (direction == 'UP') {
      if (this.focusedIndex == null) {
        this.focusedIndex = listLength - 1;
      } else if (this.focusedIndex > 0) {
        this.focusedIndex -= 1;
      } else if (this.focusedIndex == 0) {
        this.focusedIndex = listLength - 1;
      }
    }
    // Common functionality for both directions
    this.setFocus({ index: this.focusedIndex });
    this.suggestionBox.setAttribute('aria-activedescendant', 'option-' + this.focusedIndex);
  }

  // Set a focus style for the item with the index int given as an parameter.
  // Clear all other focus styles in the suggestion box.
  setFocus({ index }: { index: string | number }) {
    let list_items = this.suggestionBox.children;
    if (list_items[index] != undefined) {
      this.clearFocusStyles(list_items);
      list_items[index].className += ' focus';
      this.scrollToView(list_items[index]);
    }
  }

  // Clear focus styles from all HTML items given as a parameter.
  clearFocusStyles(items: string | any[]) {
    for (var i = 0; i < items.length; i++) {
      if (items[i] != undefined) {
        if (items[i].classList.contains('focus')) {
          items[i].classList.toggle('focus');
        }
      }
    }
  }

  // Select the item with the index int given as an parameter.
  selectItem(index: string) {
    let list_items = this.suggestionBox.children;
    if (list_items[index].getAttribute('aria-selected') === 'false') {
      this.isSelected = !this.isSelected;
      list_items[index].setAttribute('aria-selected', 'true');
      this.selectedItems.push(list_items[index].innerText);
      this.toggleEl.innerHTML = this.formatLabel(this.selectedItems);
    } else {
      list_items[index].setAttribute('aria-selected', 'false');
      this.refreshBtnLabel();
    }
  }

  // Updates the button label/content when an item is removed from the selection
  refreshBtnLabel() {
    this.selectedItems = [];
    let list_items = this.suggestionBox.children;
    for (var i = 0; i < list_items.length; i++) {
      if (list_items[i].getAttribute('aria-selected') === 'true') {
        this.selectedItems.push(list_items[i].innerText);
      }
    }
    this.toggleEl.innerHTML = this.formatLabel(this.selectedItems);
  }

  // Formats the list of selected items (content) to a visually more pleasant form
  formatLabel(content) {
    let callCount = 0;
    let string = this.placeholder;
    if (content.length != 0) {
      string = '';
      for (var i = 0; i < content.length - 1; i++) {
        string += content[i] + ', ';
        callCount += 1;
      }
      callCount += 1;
      string += content[content.length - 1];
    }
    // Truncate the selected values to stay within the width of the button and add a styled badge with the total selected.
    return this.truncateString(string, 30) + `<span class='combobox__total-selected' aria-live="polite">${callCount} selected</span>`;
  }

  truncateString(string: string, num: number) {
    if (string.length <= num) {
      return string;
    }
    return string.slice(0, num) + '...';
  }

  // Scrolls the suggestion box so that the focused element is visible.
  scrollToView(element) {
    if (this.suggestionBox.scrollHeight > this.suggestionBox.clientHeight) {
      let scrollBottom = this.suggestionBox.clientHeight + this.suggestionBox.scrollTop;
      let elementBottom = element.offsetTop + element.offsetHeight;
      if (elementBottom > scrollBottom) {
        this.suggestionBox.scrollTop = elementBottom - this.suggestionBox.clientHeight;
      } else if (element.offsetTop < this.suggestionBox.scrollTop) {
        this.suggestionBox.scrollTop = element.offsetTop;
      }
    }
  }

  render() {
    let items = [];

    if (this._options && this._options.length > 0) {
      this._options.forEach((option, i) => {
        items.push(
          <li class="combobox__list-item" value={option.value.toString()} role="option" id={'option-' + i} aria-selected="false">
            {option.label}
          </li>,
        );
      });
    }

    return (
      <Host>
        <div class="dropdown-wrapper">
          <h3 id="main-label">Favorite colour</h3>
          <div
            class="combobox"
            role="combobox"
            tabindex="0"
            aria-haspopup="listbox"
            aria-labelledby="main-label combobox"
            aria-expanded="false"
            onClick={this.mouseClickButton.bind(this)}
            onKeyDown={this.keyDownButton.bind(this)}
          >
            {this.placeholder}
          </div>
          <ul
            class="combobox__list hidden"
            onClick={this.mouseClickSuggestionBox.bind(this)}
            onKeyDown={this.keyDownSuggestionBox.bind(this)}
            tabindex="-1"
            role="listbox"
            aria-labelledby="main-label"
            aria-activedescendant=""
            aria-multiselectable="true"
          >
            {items}
          </ul>
        </div>
      </Host>
    );
  }
}
