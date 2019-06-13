const {h, Component} = require('preact')
const connect = require('unistore/preact').connect
const actions = require('../../actions')
const Modal = require('./modal')
const {ADALITE_CONFIG} = require('../../config')

class ContactForm extends Component {
  constructor(props) {
    super(props)
    this.closeContactFormModal = this.closeContactFormModal.bind(this)
  }

  closeContactFormModal() {
    this.props.closeContactFormModal()
  }

  render() {
    return h(
      Modal,
      {
        closeHandler: this.closeContactFormModal,
      },
      h(
        'main',
        {class: 'contact-modal'},
        h('h2', {class: 'export-title'}, 'Contact Us'),
        h(
          'p',
          {class: 'instructions'},
          h('span', {}, 'If you are experiencing problems, please try the following '),
          h(
            'a',
            {
              href: 'https://github.com/vacuumlabs/adalite/wiki/Troubleshooting',
              target: '_blank',
              rel: 'noopener',
            },
            'troubleshooting suggestions'
          ),
          h('span', {}, ' before contacting us. You can also reach us out via '),
          h(
            'a',
            {
              href: `mailto:${ADALITE_CONFIG.ADALITE_SUPPORT_EMAIL}`,
            },
            ADALITE_CONFIG.ADALITE_SUPPORT_EMAIL
          ),
          h('span', {}, '.')
        ),
        h(
          'form',
          {
            class: 'contact-form',
            id: 'contactForm',
            method: 'POST',
            target: '_blank',
            action: `//formspree.io/${ADALITE_CONFIG.ADALITE_SUPPORT_EMAIL}`,
          },
          h(
            'div',
            {
              class: 'form-row',
            },
            h('input', {
              type: 'text',
              autocomplete: 'off',
              placeholder: 'Your name',
              name: 'name',
              class: 'input fullwidth',
              required: true,
            }),
            h('input', {
              type: 'email',
              autocomplete: 'off',
              placeholder: 'Your email',
              name: '_replyto',
              class: 'input fullwidth',
              required: true,
            })
          ),
          h('textarea', {
            placeholder: 'Your message',
            autocomplete: 'off',
            name: 'message',
            class: 'input fullwidth textarea',
            required: true,
          }),
          h('input', {
            type: 'text',
            name: '_gotcha',
            style: 'display:none',
          }),
          h(
            'div',
            {
              class: 'contact-form-bottom',
            },
            h(
              'button',
              {
                onClick: this.closeContactFormModal,
                class: 'button secondary',
                type: 'button',
                onKeyDown: (e) => {
                  e.key === 'Enter' && e.target.click()
                },
              },
              'Back to AdaLite'
            ),
            h('input', {
              class: 'button primary wide modal-button submit',
              value: 'Submit',
              type: 'submit',
            })
          )
        ),
        h('button', {
          'onClick': this.closeContactFormModal,
          'class': 'modal-close',
          'aria-label': 'Close dialog',
          'onKeyDown': (e) => {
            e.key === 'Enter' && e.target.click()
          },
        })
      )
    )
  }
}

module.exports = connect(
  {},
  actions
)(ContactForm)
