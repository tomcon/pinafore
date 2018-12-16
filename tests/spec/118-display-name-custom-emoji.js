import { loginAsFoobar } from '../roles'
import {
  avatarInComposeBox,
  displayNameInComposeBox,
  generalSettingsButton,
  getNthStatus,
  getNthStatusSelector,
  getUrl,
  homeNavButton,
  removeEmojiFromDisplayNamesInput,
  settingsNavButton,
  sleep
} from '../utils'
import { postAs, updateUserDisplayNameAs } from '../serverActions'
import { Selector as $ } from 'testcafe'

fixture`118-display-name-custom-emoji.js`
  .page`http://localhost:4002`

test('Can put custom emoji in display name', async t => {
  await updateUserDisplayNameAs('foobar', 'foobar :blobpats:')
  await sleep(1000)
  await loginAsFoobar(t)
  await t
    .expect(displayNameInComposeBox.innerText).match(/\s*foobar\s*/)
    .expect($('.compose-box-display-name img').getAttribute('alt')).eql(':blobpats:')
    .click(displayNameInComposeBox)
    .expect(getUrl()).contains('/accounts/2')
    .expect($(`${getNthStatusSelector(0)} .status-author-name img`).getAttribute('alt')).eql(':blobpats:')
})

test('Cannot XSS using display name HTML', async t => {
  await updateUserDisplayNameAs('foobar', '<script>alert("pwn")</script>')
  await sleep(1000)
  await loginAsFoobar(t)
  await t
    .expect(displayNameInComposeBox.innerText).eql('<script>alert("pwn")</script>')
})

test('Can remove emoji from user display names', async t => {
  await updateUserDisplayNameAs('foobar', '🌈 foo :blobpats: 🌈')
  await sleep(1000)
  await loginAsFoobar(t)
  await t
    .expect(displayNameInComposeBox.innerText).match(/🌈\s+foo\s+🌈/)
    .expect($('.compose-box-display-name img').exists).ok()
    .expect(avatarInComposeBox.getAttribute('aria-label')).eql('Profile for 🌈 foo :blobpats: 🌈')
    .click(settingsNavButton)
    .click(generalSettingsButton)
    .click(removeEmojiFromDisplayNamesInput)
    .expect(removeEmojiFromDisplayNamesInput.checked).ok()
    .click(homeNavButton)
    .expect(displayNameInComposeBox.innerText).eql('foo')
    .expect($('.compose-box-display-name img').exists).notOk()
    .expect(avatarInComposeBox.getAttribute('aria-label')).eql('Profile for foo')
    .click(settingsNavButton)
    .click(generalSettingsButton)
    .click(removeEmojiFromDisplayNamesInput)
    .expect(removeEmojiFromDisplayNamesInput.checked).notOk()
    .click(homeNavButton)
    .expect(displayNameInComposeBox.innerText).match(/🌈\s+foo\s+🌈/)
    .expect($('.compose-box-display-name img').exists).ok()
    .expect(avatarInComposeBox.getAttribute('aria-label')).eql('Profile for 🌈 foo :blobpats: 🌈')
})

test('Cannot remove emoji from user display names if result would be empty', async t => {
  await updateUserDisplayNameAs('foobar', '🌈 :blobpats: 🌈')
  await sleep(1000)
  await loginAsFoobar(t)
  await t
    .expect(displayNameInComposeBox.innerText).match(/🌈\s+🌈/)
    .expect($('.compose-box-display-name img').exists).ok()
    .expect(avatarInComposeBox.getAttribute('aria-label')).eql('Profile for 🌈 :blobpats: 🌈')
    .click(settingsNavButton)
    .click(generalSettingsButton)
    .click(removeEmojiFromDisplayNamesInput)
    .expect(removeEmojiFromDisplayNamesInput.checked).ok()
    .click(homeNavButton)
    .expect(displayNameInComposeBox.innerText).match(/🌈\s+🌈/)
    .expect($('.compose-box-display-name img').exists).ok()
    .expect(avatarInComposeBox.getAttribute('aria-label')).eql('Profile for 🌈 :blobpats: 🌈')
    .click(settingsNavButton)
    .click(generalSettingsButton)
    .click(removeEmojiFromDisplayNamesInput)
    .expect(removeEmojiFromDisplayNamesInput.checked).notOk()
    .click(homeNavButton)
    .expect(displayNameInComposeBox.innerText).match(/🌈\s+🌈/)
    .expect($('.compose-box-display-name img').exists).ok()
    .expect(avatarInComposeBox.getAttribute('aria-label')).eql('Profile for 🌈 :blobpats: 🌈')
})

test('Check status aria labels for de-emojified text', async t => {
  let rainbow = String.fromCodePoint(0x1F308)
  await updateUserDisplayNameAs('foobar', `${rainbow} foo :blobpats: ${rainbow}`)
  await postAs('foobar', 'hey ho lotsa emojos')
  await sleep(1000)
  await loginAsFoobar(t)
  await t
    .click(displayNameInComposeBox)
    .expect(getNthStatus(0).getAttribute('aria-label')).match(
      new RegExp(`${rainbow} foo :blobpats: ${rainbow}, hey ho lotsa emojos, (.* ago|just now), @foobar, Public`, 'i')
    )
    .click(settingsNavButton)
    .click(generalSettingsButton)
    .click(removeEmojiFromDisplayNamesInput)
    .expect(removeEmojiFromDisplayNamesInput.checked).ok()
    .click(homeNavButton)
    .click(displayNameInComposeBox)
    .expect(getNthStatus(0).getAttribute('aria-label')).match(
      new RegExp(`foo, hey ho lotsa emojos, (.* ago|just now), @foobar, Public`, 'i')
    )
    .click(settingsNavButton)
    .click(generalSettingsButton)
    .click(removeEmojiFromDisplayNamesInput)
    .expect(removeEmojiFromDisplayNamesInput.checked).notOk()
    .click(homeNavButton)
    .click(displayNameInComposeBox)
    .expect(getNthStatus(0).getAttribute('aria-label')).match(
      new RegExp(`${rainbow} foo :blobpats: ${rainbow}, hey ho lotsa emojos, (.* ago|just now), @foobar, Public`, 'i')
    )
})

test('Check some odd emoji', async t => {
  await updateUserDisplayNameAs('foobar', 'foo 🕹📺')
  await sleep(1000)
  await loginAsFoobar(t)
  await t
    .expect(displayNameInComposeBox.innerText).eql('foo 🕹📺')
    .click(settingsNavButton)
    .click(generalSettingsButton)
    .click(removeEmojiFromDisplayNamesInput)
    .expect(removeEmojiFromDisplayNamesInput.checked).ok()
    .click(homeNavButton)
    .expect(displayNameInComposeBox.innerText).eql('foo')
    .click(settingsNavButton)
    .click(generalSettingsButton)
    .click(removeEmojiFromDisplayNamesInput)
    .expect(removeEmojiFromDisplayNamesInput.checked).notOk()
    .click(homeNavButton)
    .expect(displayNameInComposeBox.innerText).eql('foo 🕹📺')

  // clean up after all these tests are done
  await updateUserDisplayNameAs('foobar', 'foobar')
})
