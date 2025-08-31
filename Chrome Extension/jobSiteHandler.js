// Format company name from LinkedIn URL
function formatCompanyName(url, companyPath = 'company') {
    const regex = new RegExp('/' + companyPath + '/([^/\\?]+)');
    const match = url.match(regex);
    if (match) {
        const formatted = match[1]
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
        return formatted;
    }
    return null;
}

// Base handler class
class BaseJobSiteHandler {
    constructor(url, companyPath = 'company', jobsPath = null) {
        this.url = url;
        this.companyPath = companyPath;
        this.jobsPath = jobsPath;
        this.companyUrl = url + '/' + companyPath + '/';
        this.jobsUrl = jobsPath ? url + '/' + jobsPath : null;
    }

    canHandle(url) {
        return url.includes(this.url);
    }

    extractCompanyName(url) {
        // If URL contains company path, extract directly from URL
        if (this.companyUrl && url.includes(this.companyUrl)) {
            return formatCompanyName(url, this.companyPath);
        }
        // If URL contains jobs path, extract from page content
        else if (this.jobsUrl && url.includes(this.jobsUrl)) {
            const companyInfo = this.findCompanyOnWebPage();
            if (companyInfo) {
                try {
                    let companyUrl = new URL(companyInfo).toString();
                    return formatCompanyName(companyUrl, this.companyPath);
                }
                catch (error) {
                    return companyInfo;
                }
            }
        }
        return null;
    }

    findCompanyOnWebPage() {
        throw new Error('findCompanyOnWebPage method must be implemented by subclass');
    }

    // Helper method for extracting text content from DOM elements
    extractTextContent(selector, parent = document) {
        const element = parent.querySelector(selector);
        return element?.textContent?.trim() || null;
    }

    // Helper method for extracting href from DOM elements
    extractHref(selector, parent = document) {
        const element = parent.querySelector(selector);
        return element?.getAttribute('href') || null;
    }
}

// LinkedIn handler
class LinkedInHandler extends BaseJobSiteHandler {
    constructor() {
        super('linkedin.com', 'company', 'jobs');
    }

    findCompanyOnWebPage() {
        const jobDetailsDiv = document.querySelector('.job-view-layout.jobs-details');
        if (!jobDetailsDiv) {
            return null;
        }
        // First, try to find the company name div
        const companyNameDiv = jobDetailsDiv.querySelector('.job-details-jobs-unified-top-card__company-name');
        if (companyNameDiv) {
            const companyName = companyNameDiv.textContent?.trim();
            return companyName || null;
        }
        // Fallback: Look for any link containing "linkedin.com/company"
        const companyLinks = jobDetailsDiv.querySelectorAll('a[href*="linkedin.com/company"]');
        if (companyLinks.length > 0) {
            return companyLinks[0].getAttribute('href') || null;
        }
        return null;
    }
}

// CharityJob handler
class CharityJobHandler extends BaseJobSiteHandler {
    constructor() {
        super('charityjob.co.uk', 'organisation', 'jobs');
    }

    findCompanyOnWebPage() {
        const jobDetailsDiv = document.querySelector('.job-details-wrapper.scroll-wrapper') || 
                             document.querySelector('.container.job-details-wrapper.single-job-add');
        if (!jobDetailsDiv) {
            return null;
        }

        // Find the active job article (has job-id but not display-none class)
        const activeJobArticle = jobDetailsDiv.querySelector('article[job-id]:not(.display-none)');
        if (!activeJobArticle) {
            return null;
        }
        
        // Look for job-title-wrapper within the active job article
        const jobTitleDiv = activeJobArticle.querySelector('.job-details-summary .job-summary .job-title-wrapper');
        if (!jobTitleDiv) {
            return null;
        }
        
        // First, try to find the company name by the organisation link with class "text-link"
        const companyLinks = jobTitleDiv.querySelectorAll('a.text-link[href*="/organisation/"]');
        if (companyLinks.length > 0) {
            const companyName = companyLinks[0].textContent?.trim();
            return companyName || null;
        }
        
        // Fallback: Look for div with class "organisation"
        const companyName = this.extractTextContent('.organisation', jobTitleDiv);
        return companyName;
    }
}

// Job site factory
const jobSiteFactory = {
    handlers: [
        new LinkedInHandler(),
        new CharityJobHandler()
    ],
    
    extractCompanyName(url) {
        for (const handler of this.handlers) {
            if (handler.canHandle(url)) {
                return handler.extractCompanyName(url);
            }
        }
        return null;
    }
};

// Make factory globally available
window.jobSiteFactory = jobSiteFactory;