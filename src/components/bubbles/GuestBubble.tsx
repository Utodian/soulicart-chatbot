import { Show, onMount } from 'solid-js'
import { Avatar } from '../avatars/Avatar'
import { Marked } from '@ts-stack/markdown'

type Props = {
  message: string
  showAvatar?: boolean
  avatarSrc?: string
  backgroundColor?: string
  textColor?: string
}

const defaultBackgroundColor = '#E7F8FF'
const defaultTextColor = '#303235'
const defaultAvatarSrc = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'

Marked.setOptions({ isNoP: true })

export const GuestBubble = (props: Props) => {
  let userMessageEl: HTMLDivElement | undefined

  onMount(() => {
    if (userMessageEl) {
      userMessageEl.innerHTML = Marked.parse(props.message)
    }
  })

  return (
    <div
      class="flex justify-end mb-2 items-end guest-container"
      style={{ 'flex-direction': 'column' }}
    >
      <Show when={props.showAvatar}>
        <div class="chatbot-avatar" >
          <Avatar initialAvatarSrc={props.avatarSrc ?? defaultAvatarSrc} />
        </div>
      </Show>
      <span
        ref={userMessageEl}
        class="px-2 py-2 mr-2 whitespace-pre-wrap max-w-full chatbot-guest-bubble"
        data-testid="guest-bubble"
        style={{ 
          "background-color": props.backgroundColor ?? defaultBackgroundColor,
          color: props.textColor ?? defaultTextColor,
          'border-radius': '6px',
          'font-size': '13px'
        }}
      />
    </div>
  )
}
