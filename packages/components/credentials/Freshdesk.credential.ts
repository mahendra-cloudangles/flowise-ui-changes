import { INodeParams, INodeCredential } from '../src/Interface'

class Freshdesk implements INodeCredential {
    label: string
    name: string
    version: number
    description: string
    inputs: INodeParams[]
    icon: string

    constructor() {
        this.label = 'Freshdesk Credentials'
        this.name = 'freshdesk'
        this.version = 1.0
        this.inputs = [
            {
                label: 'API Key',
                name: 'freshdeskApiKey',
                type: 'password'
            },
            {
                label: 'Your Helpdesk Domain Name',
                name: 'helpdeskDomainName',
                type: 'password'
            }
            /* {
                label: 'Freshdesk Account Password',
                name: 'freshdeskPassword',
                type: 'password'
            }, */
        ]
    }
}

module.exports = { credClass: Freshdesk }
