import * as dotenv from 'dotenv'

dotenv.config()

export class FreshdeskOperations {
    private readonly freshdeskApiKey: string
    private readonly freshdeskDomain: string

    constructor(freshdeskApiKey: string, freshdeskDomain: string) {
        this.freshdeskApiKey = freshdeskApiKey
        this.freshdeskDomain = freshdeskDomain
    }

    async listAllTickets() {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets', {
                method: 'GET',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 200) {
                // console.log(response.statusText);

                const data = await response.json()
                // console.log(data);

                let result: string = data.map(
                    (s: any) =>
                        `{ "id": ${s.id}, "subject": "${s.subject}", "type": "${s.type}", "status": "${s.status}", "priority": "${s.priority}" }`
                )

                // console.log(result);
                return result
            }

            return 'Failed to fetch the tickets.'
        } catch (e: any) {
            // console.log("Error getting tickets: ", e);
            return 'Error getting tickets: ' + e
        }
    }

    async createTicket(ticket: Object) {
        try {
            // console.log("Inside the try block.");
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticket)
            })

            // console.log("POST request made.");
            const data = await response.json()

            if (response.status == 201) {
                let result: string = `{ "id": ${data.id}, "subject": "${data.subject}", "type": "${data.type}", "description_text": "${data.description_text}", "status": "${data.status}", "priority": "${data.priority}" }`

                return `Ticket successfully created (${result}).`
            } else {
                // console.log(`Response: ${JSON.stringify(data)}`);
                return `Error: ${JSON.stringify(data)}`
            }
        } catch (e: any) {
            // console.log(e);
            return `Error: ${e}`
        }
    }

    async viewTicket(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId, {
                method: 'GET',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 200) {
                const data = await response.json()
                // console.log(data);

                let result: string = `{ "id": ${data.id}, "subject": "${data.subject}", "type": "${data.type}", "description_text": "${data.description_text}", "status": "${data.status}", "priority": "${data.priority}" }`

                // console.log(result);
                return result
            }

            return 'Failed to fetch the ticket.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async updateTicket(ticketId: number, ticket: Object) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId, {
                method: 'PUT',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticket)
            })

            const data = await response.json()

            if (response.status == 200) {
                let result: string = `{ "id": ${data.id}, "subject": "${data.subject}", "type": "${data.type}", "description_text": "${data.description_text}", "status": "${data.status}", "priority": "${data.priority}" }`
                return `Ticket successfully updated (${result}).`
            } else {
                return `Error: ${JSON.stringify(data)}`
            }
        } catch (e: any) {
            console.log(e)
            return `Error: ${e}`
        }
    }

    async deleteTicket(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId, {
                method: 'DELETE',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 204) {
                return 'Ticket successfully deleted.'
            }

            return 'Failed to delete the ticket.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async forwardTicket(ticketId: number, body: string, toEmails: string[]) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/forward', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ body: body, to_emails: toEmails })
            })

            const data = await response.json()

            if (response.status == 201) {
                return `Ticket successfully forwarded (${toEmails}).`
            } else {
                return `Error: ${JSON.stringify(data)}`
            }
        } catch (e: any) {
            console.log(e)
            return `Error: ${e}`
        }
    }

    async restoreTicket(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/restore', {
                method: 'PUT',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 204) {
                return `Ticket successfully restored.`
            } else {
                return `Failed to restore the ticket.`
            }
        } catch (e: any) {
            console.log(e)
            return `Error: ${e}`
        }
    }

    async getAssociatedTickets(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/associated_tickets', {
                method: 'GET',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            console.log(response)

            if (response.status == 200) {
                const data = await response.json()
                console.log(data)

                // let result: string = `{ "id": ${data.id}, "subject": "${data.subject}", "type": "${data.type}", "description_text": "${data.description_text}", "status": "${data.status}", "priority": "${data.priority}" }`;

                // console.log(result);
                return 'OK'
            }

            return 'Failed to fetch the associated tickets.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async listAllConversations(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/conversations', {
                method: 'GET',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 200) {
                const data = await response.json()

                let result: string = data.map((s: any) => `{ ${s.body_text} }`)

                return result
            }

            return 'Failed to get the conversations.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async listAllTicketFields() {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/ticket_fields', {
                method: 'GET',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 200) {
                const data = await response.json()

                let result: string = data.map(
                    (s: any) => `{ "id": ${s.id}, "name": "${s.name}", "label": "${s.label}", "description": "${s.description}" }`
                )

                return result
            }

            return 'Failed to list all the ticket fields.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async listAllTimeEntries(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/time_entries', {
                method: 'GET',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 200) {
                const data = await response.json()

                let result: string = data.map(
                    (s: any) =>
                        `{ "id": ${s.id}, "note": "${s.note}", "billable": "${s.billable}", "agent_id": ${s.agent_id}, "time_spent": "${s.time_spent}" }`
                )

                return result
            }

            return 'Failed to list all the time entries.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async listAllSatisfactionRatings(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/satisfaction_ratings', {
                method: 'GET',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 200) {
                const data = await response.json()

                let result: string = data.map(
                    (s: any) =>
                        `{ "id": ${s.id}, "user_id": ${s.user_id}, "ticket_id": ${s.ticket_id}, "agent_id": ${s.agent_id}, "survey_id": ${s.survey_id}, "feedback": "${s.feedback}", "ratings": ${s.ratings} }`
                )

                return result
            }

            return 'Failed to list all the satisfaction ratings.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async listAllWatchers(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/watchers', {
                method: 'GET',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 200) {
                const data = await response.json()

                return `{ "watcher_ids: ${data.watcher_ids} }`
            }

            return 'Failed to list all the satisfaction ratings.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async addWatcher(ticketId: number, userId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/watch', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId })
            })

            if (response.status == 204) {
                return `Watcher successfully added to the ticket.`
            }

            return 'Failed to add watcher to the ticket.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async removeWatcher(ticketId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketId + '/unwatch', {
                method: 'PUT',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                }
            })

            if (response.status == 204) {
                return `Watcher successfully removed from the ticket.`
            }

            return 'Failed to remove watcher from the ticket.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async addWatchersToMultipleTickets(ticketIds: number[], userId: number) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/bulk_watch', {
                method: 'PUT',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: ticketIds, user_id: userId })
            })

            if (response.status == 204) {
                return `Watcher successfully added to the tickets.`
            }

            return 'Failed to add watcher to the tickets.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async removeWatchersFromMultipleTickets(ticketIds: number[]) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/bulk_unwatch', {
                method: 'PUT',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: ticketIds })
            })

            if (response.status == 204) {
                return `Watcher successfully removed from the tickets.`
            }

            return 'Failed to remove watcher from the tickets.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async deleteMultipleTickets(ticketIds: number[]) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/bulk_delete', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ids: ticketIds })
            })

            if (response.status == 202) {
                const data = await response.json()

                return JSON.stringify(data)
            }

            return 'Failed to delete the tickets.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async createReply(ticketID: number, body: string) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketID + '/reply', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ body: body })
            })

            if (response.status == 201) {
                const data = await response.json()

                let result: string = `{ "id": ${data.id}, "user_id": ${data.user_id}, "from_email": "${data.from_email}", "body_text": "${data.body_text}" }`

                return result
            }

            return 'Failed to create a reply.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }

    async CreateNote(ticketID: number, body: string, isPrivate: boolean) {
        try {
            const response = await fetch(this.freshdeskDomain + '/api/v2/tickets/' + ticketID + '/notes', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ` + btoa(`${this.freshdeskApiKey}:X`),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ body: body, private: isPrivate })
            })

            if (response.status == 201) {
                const data = await response.json()

                let result: string = `{ "id": ${data.id}, "user_id": ${data.user_id}, "private": "${data.private}", "body_text": "${data.body_text}", "ticket_id": ${data.ticket_id} }`

                return result
            }

            return 'Failed to create a note.'
        } catch (e: any) {
            return `Error: ${e}`
        }
    }
}

export const main = async () => {
    const response = await new FreshdeskOperations('OGd9b1kiefOFphvBWR5Q', 'https://bakerstreet.freshdesk.com').CreateNote(
        14,
        'Hi there.',
        false
    )

    console.log(`${response}`)
}

// await main();
