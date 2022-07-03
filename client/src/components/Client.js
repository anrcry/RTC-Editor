import { ListGroup, Badge } from 'react-bootstrap';


const ACCESS_LEVEL = {
    manage: {
      text: 'Manager',
      variant: 'primary'
    },
    edit: {
      text: 'Editor',
      variant: 'info',
    },
    view:{
      text: 'Viewer',
      variant: 'secondary'
    }
};

function RTCClientBadge( { role } ) {
    if(typeof role !== "string" || role.length === 0 || role in ACCESS_LEVEL === false) return null

    return (
        <Badge bg={ACCESS_LEVEL[role]['variant']} className="position-absolute me-auto badge-postion">{ACCESS_LEVEL[role]['text']}</Badge>
    )

}

export default function RTCClients( { clients } ) {
    if(clients.length === 0) return null
    return (
        <>
            <h2>You are collaborating with</h2>
            <ListGroup /* key={`list-group-${clients.length}`} */ className="g-2 g-lg-3" horizontal={['sm']}>
                {clients.map(client => (
                    <RTCClient key={client.clientId} {...client} />
                ))}
            </ListGroup>
            <hr/>
        </>
    )
}

function RTCClient({userId, access, clientId, caretNumber, clientInfo, userDetails }){

    const role = { role: access }

    return (
        <ListGroup.Item className="border-0 p-0" /* key={`${clientId}-item`} */>
            <div className={["chip", `rtc-caret-${caretNumber}-color`].join(" ")}>
                <img src={`https://avatars.dicebear.com/api/bottts/${userId}.svg?b=lightgrey&r=50&size=200&scale=95`} alt={`Avatar of ${userDetails?.fullName}`} />
                <div className="d-inline-grid position-relative">
                    <span className="fs-4 fw-bolder text">{userDetails?.fullName}</span>
                    <RTCClientBadge key={`${clientId}-badge`} {...role} />
                </div>
            </div>
        </ListGroup.Item>
    );
}