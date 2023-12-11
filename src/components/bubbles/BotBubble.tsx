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

const defaultBackgroundColor = '#F2F2F2'
const defaultTextColor = '#303235'
const defaultAvatarSrc = 'https://pbs.twimg.com/profile_images/1632508578966945793/Q-AMOpV9_400x400.jpg'

Marked.setOptions({ isNoP: true })

export const BotBubble = (props: Props) => {
  let botMessageEl: HTMLDivElement | undefined

  onMount(() => {
    if (botMessageEl) {
      botMessageEl.innerHTML = Marked.parse(props.message)
    }
  })

  return (
    <div
      class="flex justify-start mb-2 items-start host-container"
      style={{ 'flex-direction': 'column' }}
    >
      <Show when={props.showAvatar}>
        <div class="chatbot-avatar" >
          <Avatar initialAvatarSrc={props.avatarSrc ?? defaultAvatarSrc} />
        </div>
      </Show>
      <span
        ref={botMessageEl}
        class="px-2 py-2 ml-2 whitespace-pre-wrap max-w-full chatbot-host-bubble"
        data-testid="host-bubble"
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
