// Base handler class
abstract class BaseJobSiteHandler {
    companyUrl: string
    jobsUrl: string | null

    protected constructor(
        readonly url:string,
        readonly companyPath: string = 'company',
        readonly jobsPath: string | null = null
    ) {
        this.companyUrl = url + '/' + companyPath + '/'
        this.jobsUrl = jobsPath ? url + '/' + jobsPath : null
    }

    canHandle(url: string): boolean {
        return url.includes(this.url)
    }

    extractCompanyName(url: string): string | null {
        // If URL contains company path, extract directly from URL
        if (url.includes(this.companyUrl)) {
            return this.formatCompanyName(url);
        }
        // If URL contains jobs path, extract from page content
        else if (this.jobsUrl && url.includes(this.jobsUrl)) {
            return this.findCompanyNameOnWebPage()
        }
        return null
    }

    protected formatCompanyName(url: string): string | null {
        const regex = new RegExp('/' + this.companyPath + '/([^/\\?]+)');
        const match = url.match(regex)
        return match ? match[1]
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
                .trim() : null
    }

    abstract findCompanyNameOnWebPage(): string | null
}

// LinkedIn handler
class LinkedInHandler extends BaseJobSiteHandler {
    constructor() {
        super('linkedin.com', 'company', 'jobs')
    }

    findCompanyNameOnWebPage(): string | null {
        type CompanyQueryResult = {
            href: string,
            contents: string
        }

        const companyQueryResults: CompanyQueryResult[] =
            [...document.querySelectorAll<HTMLAnchorElement>('a[href*="/company/"]')]
            .map(a => ({href: a.href, contents: a.textContent.trim()})
        )

        if (companyQueryResults.length === 0) {
            return null
        }

        const firstPresentCompany = companyQueryResults.find(
            result => (result.contents)
        )
        const firstPresentCompanyName = firstPresentCompany?.contents ?? this.formatCompanyName(companyQueryResults[0].href)

        return firstPresentCompanyName || null
    }
}

// CharityJob handler
class CharityJobHandler extends BaseJobSiteHandler {
    constructor() {
        super('charityjob.co.uk', 'organisation', 'jobs')
    }

    findCompanyNameOnWebPage(): string | null {
        const jobDetailsDiv = document.querySelector('.job-details-wrapper.scroll-wrapper') || 
                             document.querySelector('.container.job-details-wrapper.single-job-add')
        if (!jobDetailsDiv) {
            return null
        }

        // Find the active job article (has job-id but not display-none class)
        const activeJobArticle = jobDetailsDiv.querySelector('article[job-id]:not(.display-none)')
        if (!activeJobArticle) {
            return null
        }
        
        // Look for job-title-wrapper within the active job article
        const jobTitleDiv = activeJobArticle.querySelector('.job-details-summary .job-summary .job-title-wrapper')
        if (!jobTitleDiv) {
            return null
        }
        
        // First, try to find the company name by the organisation link with class "text-link"
        const companyLinks = jobTitleDiv.querySelectorAll('a.text-link[href*="/organisation/"]')
        if (companyLinks.length > 0) {
            const companyName = companyLinks[0].textContent?.trim()
            return companyName || null
        } else {
            const companyName = jobTitleDiv.querySelectorAll('.organisation')
            return companyName[0]?.textContent?.trim() || null
        }
    }
}

const jobSiteHandlers: BaseJobSiteHandler[] = [
    new LinkedInHandler(),
    new CharityJobHandler()
]

// Job site factory
const jobSiteFactory = {
    extractCompanyName(url: string): string | null {
        for (const handler of jobSiteHandlers) {
            if (handler.canHandle(url)) {
                return handler.extractCompanyName(url)
            }
        }
        return null
    }
}
