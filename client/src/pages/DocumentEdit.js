import { detect } from 'detect-browser';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { decode } from 'jsonwebtoken';
import { 
  getContent, 
  getJwt,
  getSecretKey, 
  getUserAccessLevel, 
  getUserDetails, 
  saveContent, 
  useCollaborators, 
  useDocumentTitle 
} from '../api/api';
// eslint-disable-next-line no-unused-vars
import { ListGroup } from 'react-bootstrap';
// eslint-disable-next-line no-unused-vars
import RTCClients from '../components/Client';

/** @type {{type: string, name: string, version: string | null, os: string | null} | null} */
const browser = detect();

const config = {
  height: 800,
  plugins:
  [`preview 
    searchreplace 
    autolink
    visualblocks 
    visualchars 
    fullscreen 
    image
    link 
    media
    charmap
    pagebreak
    insertdatetime
    advlist
    lists
    wordcount
    help
    charmap
    quickbars
    emoticons
    code
    codesample`],
  /* IMAGE */
  editimage_cors_hosts: ['picsum.photos'],
  image_advtab: true,
  image_uploadtab: true,
  images_file_types: 'jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp',
  /* Bar Starts here */
  menubar: 'file edit view insert format tools help',
  removed_menuitems: 'newdocument',
  quickbars_selection_toolbar: 'bold italic underline | quicklink blockquote | h1 h2 h3',
  quickbars_insert_toolbar: false,
  quickbars_image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
  toolbar: 'bold italic underline strikethrough | fontfamily fontsize blocks | undo redo | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen preview print | image link code codesample',
  toolbar_sticky: true,
  toolbar_mode: 'wrap',
  skin: 'oxide',
};

// eslint-disable-next-line no-unused-vars


export default function DocumentEdit({ token }) {
  const { documentId } = useParams();
  const { sub: username } = token ? decode(token) : {};
  const title = useDocumentTitle({ documentId });
  const { access } = useCollaborators({ documentId, username });
  const accessCanEdit = access === 'manage' || access === 'edit';

  /**
   * The details of another user that is currently editing the document.
   * @typedef {object} Client
   * @property {string} userId the client user ID which is the `sub` field in the JWT.
   * @property {{fullName: string}} userDetails the client details which always includes the `fullName`.
   * @property {string} clientId a unique string identifying the client.
   * @property {number} caretNumber the caret number in range 1-8 (inclusive).
   * @property {{browser?: string}} clientInfo additional information about the client.
   */

  /** 
   * @type {[Client[], React.Dispatch<React.SetStateAction<Client[]>>]} 
   */
  const [clients, setClients] = useState([]);

  console.log(clients, clients[0]?.caretNumber);

  /**
   * Store a connecting client.
   * @param {Client} newClient the connecting client.
   */
  const clientConnected = async (newClient) => {
    let { access } = await getUserAccessLevel({userId: newClient.userId, documentId})
    newClient = {...newClient, access}
    setClients((existingClients) => [...existingClients, newClient]);
    console.log(newClient);
  }

  /**
   * Delete a disconnecting client.
   * @param {Client} removedClient the disconnecting client.
   */
  const clientDisconnected = (removedClient) => setClients((existingClients) => existingClients.filter((client) => client.clientId !== removedClient.clientId));

  return (
    <>
      <h1>{title}</h1>
      
      <RTCClients clients={clients} />
    
      <Editor
        key={documentId}
        cloudChannel='6'
        apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
        disabled={!accessCanEdit}
        init={{
          ...config,
          plugins: 'rtc ' + config.plugins.join(' '),
          /**
           * RTC uses a unique ID to identify documents, which must be provided
           * by your application.
           * This setting is required.
           * @type {string} unique document ID.
           */
           rtc_document_id: documentId,
           /**
           * 
           * RTC uses a JWT to identify clients which must be provided on request
           * by your application.
           * RTC requires that the returned JWT is valid and signed by a keypair
           * that has been registered with the cloud account for the API key in
           * use.
           * It is preferred that the returned JWT has a short expiry, is specific 
           * to a single document and specifies the user's role using additional claims.
           * This setting is required.
           * @type {(inputs: {documentId: string}) => Promise.<{token: string}>} token provider callback.
           */
            rtc_token_provider: getJwt,
           /**
           * To ensure privacy of your content the RTC plugin encrypts all
           * messages that need to be sent to the RTC server.
           * The key to encrypt the messages is provided by your application on
           * request by the RTC plugin.
           * The server never has access to the encryption key so it can't view
           * the contents of the document.
           * This setting is required.
           * @type {(inputs: {documentId: string, keyHint: string | null}) => Promise.<{key: string, keyHint: string}>} key provider callback.
           */
            rtc_encryption_provider: getSecretKey,
            /**
           * The first time that RTC loads on a document when it hasn't seen
           * the document ID before it will get the starting content from your
           * application.
           * All later times the encrypted snapshots and messages will be 
           * retrieved from the RTC server and replayed on the client to
           * recreate the document content.
           * This setting is optional. If not provided then the content
           * will come from the textarea the editor is initialized on.
           * @type {(inputs: {documentId: string}) => Promise.<{content: string}>} content provider callback.
           */
          rtc_initial_content_provider: getContent,
          /**
           * The RTC plugin periodically calls this function to allow
           * integrators to save the document. The version number
           * provided allows the integrator to tell old and new snapshots apart.
           * This setting is optional though strongly recommended. Leaving out
           * this setting is only really possible on prototypes as it is the only
           * reliable way the editor content can be saved.
           * @type {(inputs: {documentId: string, version: number, getContent: () => string}) => void} content saving callback.
           */
           rtc_snapshot: ({documentId, version, getContent}) => saveContent({documentId, version, content: getContent()}),
           /**
           * The RTC plugin calls this function when it encounters a new user.
           * This provides the full name of the user by default but any information
           * that can be encoded as JSON can be passed.
           * This setting is optional. If not provided then users will be
           * identified by their ID.
           * @type {(inputs: {userId: string}) => Promise.<{fullName: string}>} user details callback.
           */
          rtc_user_details_provider: getUserDetails,
          /**
           * The RTC plugin calls this method when a client connects.
           * This includes the details from the rtc_user_details_provider and
           * the extra data provided to rtc_client_info.
           * This setting is optional.
           * @type {(client: Client) => void} client connected callback.
           */
           rtc_client_connected: clientConnected,

           /**
            * The RTC plugin calls this method when a client disconnects.
            * This includes the details from the rtc_user_details_provider and
            * the extra data provided to rtc_client_info.
            * This setting is optional.
            * @type {(client: Client) => void} client disconnected callback.
            */
           rtc_client_disconnected: clientDisconnected,
           /**
           * The RTC plugin transmits this data to all other clients.
           * The only restriction is that this must be encodable as JSON.
           * This setting is optional.
           */
          rtc_client_info: { browser: browser?.name, timeConnected: new Date()?.toISOString(), remote_ip: null},
        }}
      />
    </>
  );
}