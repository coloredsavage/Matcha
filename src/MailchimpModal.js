import Modal from "./Modal"
import "./MailchimpModal.css"

const MailchimpModal = ({ onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="mailchimp-container">
        {/* Close Button is now handled by the Modal component */}
        <div className="mailchimp-header">
          <h2>Stay Updated!</h2>
          <p>Get notified about new features, challenges, and updates.</p>
        </div>

        <div id="mc_embed_signup">
          <form
            action="https://gmail.us7.list-manage.com/subscribe/post?u=ef4a2666c0901d4e16309a629&amp;id=bd6d7e6a4d&amp;f_id=0043a0e0f0"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="validate"
            target="_blank"
          >
            <div id="mc_embed_signup_scroll">
              <div className="indicates-required">
                <span className="asterisk">*</span> indicates required
              </div>
              <div className="mc-field-group">
                <label htmlFor="mce-EMAIL">
                  Email Address <span className="asterisk">*</span>
                </label>
                <input type="email" name="EMAIL" className="required email" id="mce-EMAIL" required="" />
              </div>
              <div id="mce-responses" className="clear foot">
                <div className="response" id="mce-error-response" style={{ display: "none" }}></div>
                <div className="response" id="mce-success-response" style={{ display: "none" }}></div>
              </div>
              <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
                {/* real people should not fill this in and expect good things - do not remove this or risk form bot signups */}
                <input type="text" name="b_ef4a2666c0901d4e16309a629_bd6d7e6a4d" tabIndex="-1" value="" />
              </div>
              <div className="optionalParent">
                <div className="clear foot">
                  <input
                    type="submit"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="button"
                    value="Subscribe"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="mailchimp-footer">
          <p>No spam, just game updates. Unsubscribe anytime.</p>
        </div>
      </div>
    </Modal>
  )
}

export default MailchimpModal

