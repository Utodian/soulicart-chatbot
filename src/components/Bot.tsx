import { createSignal, createEffect, For, onMount } from 'solid-js'
import { sendMessageQuery, isStreamAvailableQuery, IncomingInput } from '@/queries/sendMessageQuery'
import { TextInput } from './inputs/textInput'
import { GuestBubble } from './bubbles/GuestBubble'
import { BotBubble } from './bubbles/BotBubble'
import { LoadingBubble } from './bubbles/LoadingBubble'
import { SourceBubble } from './bubbles/SourceBubble'
import { BotMessageTheme, TextInputTheme, UserMessageTheme } from '@/features/bubble/types'
import { Badge } from './Badge'
import socketIOClient from 'socket.io-client'
import { Popup } from '@/features/popup'

type messageType = 'apiMessage' | 'userMessage' | 'usermessagewaiting'

export type MessageType = {
    message: string
    type: messageType,
    sourceDocuments?: any
}

export type BotProps = {
    chatflowid: string
    apiHost?: string
    chatflowConfig?: Record<string, unknown>
    welcomeMessage?: string
    botMessage?: BotMessageTheme
    userMessage?: UserMessageTheme
    textInput?: TextInputTheme
    poweredByTextColor?: string
    badgeBackgroundColor?: string
    fontSize?: number
}

// const defaultWelcomeMessage = 'Hi there! How can I help?'

const defaultWelcomeMessage = 'Hi there, would you like some recommendations on light decoration products?'

/*const sourceDocuments = [
    {
        "pageContent": "I know some are talking about “living with COVID-19”. Tonight – I say that we will never just accept living with COVID-19. \r\n\r\nWe will continue to combat the virus as we do other diseases. And because this is a virus that mutates and spreads, we will stay on guard. \r\n\r\nHere are four common sense steps as we move forward safely.  \r\n\r\nFirst, stay protected with vaccines and treatments. We know how incredibly effective vaccines are. If you’re vaccinated and boosted you have the highest degree of protection. \r\n\r\nWe will never give up on vaccinating more Americans. Now, I know parents with kids under 5 are eager to see a vaccine authorized for their children. \r\n\r\nThe scientists are working hard to get that done and we’ll be ready with plenty of vaccines when they do. \r\n\r\nWe’re also ready with anti-viral treatments. If you get COVID-19, the Pfizer pill reduces your chances of ending up in the hospital by 90%.",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "loc": {
            "lines": {
              "from": 450,
              "to": 462
            }
          }
        }
    },
    {
        "pageContent": "sistance,  and  polishing  [65].  For  instance,  AI  tools  generate\nsuggestions based on inputting keywords or topics. The tools\nanalyze  search  data,  trending  topics,  and  popular  queries  to\ncreate  fresh  content.  What’s  more,  AIGC  assists  in  writing\narticles and posting blogs on specific topics. While these tools\nmay not be able to produce high-quality content by themselves,\nthey can provide a starting point for a writer struggling with\nwriter’s block.\nH.  Cons of AIGC\nOne of the main concerns among the public is the potential\nlack  of  creativity  and  human  touch  in  AIGC.  In  addition,\nAIGC sometimes lacks a nuanced understanding of language\nand context, which may lead to inaccuracies and misinterpre-\ntations. There are also concerns about the ethics and legality\nof using AIGC, particularly when it results in issues such as\ncopyright  infringement  and  data  privacy.  In  this  section,  we\nwill discuss some of the disadvantages of AIGC (Table IV).",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "pdf": {
            "version": "1.10.100",
            "info": {
              "PDFFormatVersion": "1.5",
              "IsAcroFormPresent": false,
              "IsXFAPresent": false,
              "Title": "",
              "Author": "",
              "Subject": "",
              "Keywords": "",
              "Creator": "LaTeX with hyperref",
              "Producer": "pdfTeX-1.40.21",
              "CreationDate": "D:20230414003603Z",
              "ModDate": "D:20230414003603Z",
              "Trapped": {
                "name": "False"
              }
            },
            "metadata": null,
            "totalPages": 17
          },
          "loc": {
            "pageNumber": 8,
            "lines": {
              "from": 301,
              "to": 317
            }
          }
        }
    },
    {
        "pageContent": "Main article: Views of Elon Musk",
        "metadata": {
          "source": "https://en.wikipedia.org/wiki/Elon_Musk",
          "loc": {
            "lines": {
              "from": 2409,
              "to": 2409
            }
          }
        }
    },
    {
        "pageContent": "First Name: John\nLast Name: Doe\nAddress: 120 jefferson st.\nStates: Riverside\nCode: NJ\nPostal: 8075",
        "metadata": {
          "source": "blob",
          "blobType": "",
          "line": 1,
          "loc": {
            "lines": {
              "from": 1,
              "to": 6
            }
          }
        }
    },
]*/

export const Bot = (props: BotProps & { class?: string }) => {
    let chatContainer: HTMLDivElement | undefined
    let bottomSpacer: HTMLDivElement | undefined
    let botContainer: HTMLDivElement | undefined

    const [userInput, setUserInput] = createSignal('')
    const [loading, setLoading] = createSignal(false)
    const [sourcePopupOpen, setSourcePopupOpen] = createSignal(false)
    const [sourcePopupSrc, setSourcePopupSrc] = createSignal({})
    const [messages, setMessages] = createSignal<MessageType[]>([
        {
            message: props.welcomeMessage ?? defaultWelcomeMessage,
            type: 'apiMessage'
        },
    ], { equals: false })
    const [socketIOClientId, setSocketIOClientId] = createSignal('')
    const [isChatFlowAvailableToStream, setIsChatFlowAvailableToStream] = createSignal(false)
    const [num, setNum] = createSignal(0)

    onMount(() => {
        if (!bottomSpacer) return
        setTimeout(() => {
            chatContainer?.scrollTo(0, chatContainer.scrollHeight)
        }, 50)
    })

    const scrollToBottom = () => {
        setTimeout(() => {
            chatContainer?.scrollTo(0, chatContainer.scrollHeight)
        }, 50)
    }

    const updateLastMessage = (text: string) => {
        setMessages(data => {
            const updated = data.map((item, i) => {
                if (i === data.length - 1) {
                    return { ...item, message: item.message + text };
                }
                return item;
            });
            return [...updated];
        });
    }

    const updateLastMessageSourceDocuments = (sourceDocuments: any) => {
        setMessages(data => {
            const updated = data.map((item, i) => {
                if (i === data.length - 1) {
                    return { ...item, sourceDocuments: sourceDocuments };
                }
                return item;
            });
            return [...updated];
        });
    }

    // Handle errors
    const handleError = (message = 'Oops! There seems to be an error. Please try again.') => {
        setMessages((prevMessages) => [...prevMessages, { message, type: 'apiMessage' }])
        setLoading(false)
        setUserInput('')
        scrollToBottom()
    }

    const texts: { [key: number]: string } = {
        0: "<div>To better assist you, is this a gift or for yourself?</div>",
        // 1: `<p>I understand that apartments in NY can be a very small space and you do want some magical decorations to make it special and homey!</p>
        // <p>If that's your purpose, you've come to the right place. Let me show you a few popular products based on sales and reviews:</p>
        // <strong>Galaxy Starry Sky Bluetooth Music Speaker LED Night Light:</strong>
        // <p>This LED light not only illuminates your room with a beautiful starry sky effect but also doubles as a Bluetooth music speaker. Imagine relaxing in your new home, surrounded by a mesmerizing galaxy of stars while listening to your favorite tunes. It's the perfect combination of visual and auditory delight. It's a truly magical and romantic gift that will surely make her new place feel like home.</p>
        // <strong>Planetarium Galaxy Night Light Projector Series:</strong>
        // <p>Both projectors are designed to bring the beauty of the galaxy right into your home. With their advanced technology, they can project a mesmerizing galaxy pattern onto your walls or ceiling, creating a truly immersive experience. The projectors come with multiple color options and adjustable brightness settings, allowing you to customize the ambiance to your liking. Whether you want to relax, meditate, or simply enjoy a peaceful night under the stars, these projectors are perfect for creating a serene and dreamy atmosphere.</p>
        // <p>What do you think? Any other factors you want me to consider?</p>`,
        1: `<div>I understand that apartments in NY can be a very small space and you do want some magical decorations to make it special and homey!</div>
        <div>If that's your purpose, you've come to the right place. Let me show you a few popular products based on sales and reviews:</div>
<strong>Galaxy Starry Sky Bluetooth Music Speaker LED Night Light:</strong>
        <div>This LED light not only illuminates your room with a beautiful starry sky effect but also doubles as a Bluetooth music speaker. Imagine relaxing in your new home, surrounded by a mesmerizing galaxy of stars while listening to your favorite tunes. It's the perfect combination of visual and auditory delight. It's a truly magical and romantic gift that will surely make her new place feel like home.</div>
<img src="https://tjhomesmart.com/cdn/shop/products/Galaxy-Starry-Sky-Bluetooth-Projector-Music-Speaker-LED-Night-Light-Projector-Nebula-Ocean-Star-Projector-Moon_jpg_Q90_jpg_2048x2057.webp?v=1664904302">
<strong>Planetarium Galaxy Night Light Projector Series:</strong>
        <div>Both projectors are designed to bring the beauty of the galaxy right into your home. With their advanced technology, they can project a mesmerizing galaxy pattern onto your walls or ceiling, creating a truly immersive experience. The projectors come with multiple color options and adjustable brightness settings, allowing you to customize the ambiance to your liking. Whether you want to relax, meditate, or simply enjoy a peaceful night under the stars, these projectors are perfect for creating a serene and dreamy atmosphere.</div>
<img src="https://tjhomesmart.com/cdn/shop/products/81RSguZEkML._AC_SX679_2048x2048.jpg?v=1664556557">
        <div>What do you think? Any other factors you want me to consider?</div>`,
        2: `<div>Ah, I see you're torn. Both are fantastic choices, but let me help you make a decision.
Ultimately, the choice depends on your personal preferences. If you're looking for a multifunctional piece that combines both visual and auditory elements, the Galaxy Starry Sky Bluetooth Music Speaker LED Night Light is the way to go. However, if you're more interested in a realistic and detailed projection of the night sky, the Planetarium Galaxy Night Light Projector Series is the perfect choice.
I hope this helps. If you have any more questions or need further assistance, feel free to ask!</dv>`
    }

    

    // Handle form submission
    const handleSubmit = async (value: string) => {
        setUserInput(value)

        if (value.trim() === '') {
            return
        }

        setLoading(true)
        scrollToBottom()

        // Send user question and history to API
        const welcomeMessage = props.welcomeMessage ?? defaultWelcomeMessage
        const messageList = messages().filter((msg) => msg.message !== welcomeMessage)

        setMessages((prevMessages) => [...prevMessages, { message: value, type: 'userMessage' }])

        const body: IncomingInput = {
            question: value,
            history: messageList
        }

        if (props.chatflowConfig) body.overrideConfig = props.chatflowConfig

        if (isChatFlowAvailableToStream()) body.socketIOClientId = socketIOClientId()

        const result = await sendMessageQuery({
            chatflowid: props.chatflowid,
            apiHost: props.apiHost,
            body
        })
        console.log("back", result)
        const data = {
            text: texts[num()],
            // sourceDocuments: "source"
        }


        setMessages((prevMessages) => [
            ...prevMessages,
            { message: data.text, type: 'apiMessage' }
        ])
        console.log("aa")
        setLoading(false)
        console.log("after")
        setUserInput('')
        scrollToBottom()
        setNum(num() + 1)

        // if (result.data) {

        //     const data = handleVectaraMetadata(result.data)

        //     if (typeof data === 'object' && data.text && data.sourceDocuments) {
        //         if (!isChatFlowAvailableToStream()) {
        //             setMessages((prevMessages) => [
        //                 ...prevMessages,
        //                 { message: data.text, sourceDocuments: data.sourceDocuments, type: 'apiMessage' }
        //             ])
        //         }
        //     } else {
        //         if (!isChatFlowAvailableToStream()) setMessages((prevMessages) => [...prevMessages, { message: data, type: 'apiMessage' }])
        //     }
        //     setLoading(false)
        //     setUserInput('')
        //     scrollToBottom()
        // }
        // if (result.error) {
        //     const error = result.error
        //     console.error(error)
        //     const err: any = error
        //     const errorData = typeof err === 'string'? err :err.response.data || `${err.response.status}: ${err.response.statusText}`
        //     handleError(errorData)
        //     return
        // }
    }

    // Auto scroll chat to bottom
    createEffect(() => {
        if (messages()) scrollToBottom()
    })

    createEffect(() => {
        if (props.fontSize && botContainer) botContainer.style.fontSize = `${props.fontSize}px`
    })

    // eslint-disable-next-line solid/reactivity
    createEffect(async () => {
        const { data } = await isStreamAvailableQuery({
            chatflowid: props.chatflowid,
            apiHost: props.apiHost,
        })

        if (data) {
            setIsChatFlowAvailableToStream(data?.isStreaming ?? false)
        }

        const socket = socketIOClient(props.apiHost as string)

        socket.on('connect', () => {
            setSocketIOClientId(socket.id)
        })

        socket.on('start', () => {
            setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }])
        })

        socket.on('sourceDocuments', updateLastMessageSourceDocuments)

        socket.on('token', updateLastMessage)

        // eslint-disable-next-line solid/reactivity
        return () => {
            setUserInput('')
            setLoading(false)
            setMessages([
                {
                    message: props.welcomeMessage ?? defaultWelcomeMessage,
                    type: 'apiMessage'
                }
            ])
            if (socket) {
                socket.disconnect()
                setSocketIOClientId('')
            }
        }
    })

    const isValidURL = (url: string): URL | undefined => {
        try {
            return new URL(url)
        } catch (err) {
            return undefined
        }
    }

    const handleVectaraMetadata = (message: any): any => {
        if (message.sourceDocuments && message.sourceDocuments[0].metadata.length) {
            message.sourceDocuments = message.sourceDocuments.map((docs: any) => {
                const newMetadata: { [name: string]: any } = docs.metadata.reduce((newMetadata: any, metadata: any) => {
                    newMetadata[metadata.name] = metadata.value;
                    return newMetadata;
                }, {})
                return {
                    pageContent: docs.pageContent,
                    metadata: newMetadata,
                }
            })
        }
        return message
    };

    const removeDuplicateURL = (message: MessageType) => {
        const visitedURLs: string[] = []
        const newSourceDocuments: any = []

        message = handleVectaraMetadata(message)

        message.sourceDocuments.forEach((source: any) => {
            if (isValidURL(source.metadata.source) && !visitedURLs.includes(source.metadata.source)) {
                visitedURLs.push(source.metadata.source)
                newSourceDocuments.push(source)
            } else if (!isValidURL(source.metadata.source)) {
                newSourceDocuments.push(source)
            }
        })
        return newSourceDocuments
    }

    return (
        <>
            <div ref={botContainer} class={'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center chatbot-container ' + props.class}>
                <div class="flex w-full h-full justify-center">
                    <div style={{ "padding-bottom": '100px' }} ref={chatContainer} class="overflow-y-scroll min-w-full w-full min-h-full px-3 pt-10 relative scrollable-container chatbot-chat-view scroll-smooth">
                        <For each={[...messages()]}>
                            {(message, index) => (
                                <>
                                    {message.type === 'userMessage' && (
                                        <GuestBubble
                                            message={message.message}
                                            backgroundColor={props.userMessage?.backgroundColor}
                                            textColor={props.userMessage?.textColor}
                                            showAvatar={props.userMessage?.showAvatar}
                                            avatarSrc={props.userMessage?.avatarSrc}
                                        />
                                    )}
                                    {message.type === 'apiMessage' && (
                                        <BotBubble
                                            message={message.message}
                                            backgroundColor={props.botMessage?.backgroundColor}
                                            textColor={props.botMessage?.textColor}
                                            showAvatar={props.botMessage?.showAvatar}
                                            avatarSrc={props.botMessage?.avatarSrc}
                                        />
                                    )}
                                    {message.type === 'userMessage' && loading() && index() === messages().length - 1 && (
                                        <LoadingBubble />
                                    )}
                                    {message.sourceDocuments && message.sourceDocuments.length &&
                                        <div style={{ display: 'flex', "flex-direction": 'row', width: '100%' }}>
                                            <For each={[...removeDuplicateURL(message)]}>
                                                {(src) => {
                                                    const URL = isValidURL(src.metadata.source)
                                                    return (
                                                        <SourceBubble
                                                            pageContent={URL ? URL.pathname : src.pageContent}
                                                            metadata={src.metadata}
                                                            onSourceClick={() => {
                                                                if (URL) {
                                                                    window.open(src.metadata.source, '_blank')
                                                                }
                                                                else {
                                                                    setSourcePopupSrc(src);
                                                                    setSourcePopupOpen(true);
                                                                }
                                                            }}
                                                        />
                                                    )
                                                }}
                                            </For>
                                        </div>}
                                </>
                            )}
                        </For>
                    </div>
                    <TextInput
                        backgroundColor={props.textInput?.backgroundColor}
                        textColor={props.textInput?.textColor}
                        placeholder={props.textInput?.placeholder}
                        sendButtonColor={props.textInput?.sendButtonColor}
                        fontSize={props.fontSize}
                        defaultValue={userInput()}
                        onSubmit={handleSubmit}
                    />
                </div>
                <Badge badgeBackgroundColor={props.badgeBackgroundColor} poweredByTextColor={props.poweredByTextColor} botContainer={botContainer} />
                <BottomSpacer ref={bottomSpacer} />
            </div>
            {sourcePopupOpen() && <Popup isOpen={sourcePopupOpen()} value={sourcePopupSrc()} onClose={() => setSourcePopupOpen(false)} />}
        </>
    )
}

type BottomSpacerProps = {
    ref: HTMLDivElement | undefined
}
const BottomSpacer = (props: BottomSpacerProps) => {
    return <div ref={props.ref} class="w-full h-32" />
}
