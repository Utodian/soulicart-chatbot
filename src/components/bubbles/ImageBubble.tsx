
type Props = {
    href?: string[]
}

export const ImageBubble = (props: Props) => {
    return (
        <div
            style={{
                'display': 'flex',
                'flex-wrap': 'wrap'
              }}
        >
            {props.href && props.href.map((href, index) => (
                <div 
                    style={{
                        'flex': '1 1 calc(33.333% - 10px)',
                        'margin': '5px'
                    }}
                >
                    <img style={{ 'width': '100%', 'height': '130px' }} src={href} alt={`Image ${index}`} />
                </div>
            ))}
        </div>
    );
}