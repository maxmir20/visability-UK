// Format company name from LinkedIn URL
function formatCompanyName(url) {
    const match = url.match(/\/company\/([^\/\?]+)/);
    if (match) {
        const formatted = match[1]
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
        return formatted;
    }
    return null;
}

// LinkedIn handler
class LinkedInHandler {
    canHandle(url) {
        return url.includes('linkedin.com');
    }

    extractCompanyName(url) {
        if (url.includes('linkedin.com/company/')) {
            return formatCompanyName(url);
        }
        else if (url.startsWith('https://www.linkedin.com/jobs/')) {
            const companyInfo = this.findCompanyOnWebPage();
            if (companyInfo) {
                try {
                    let companyUrl = new URL(companyInfo).toString();
                    return formatCompanyName(companyUrl);
                }
                catch (error) {
                    return companyInfo;
                }
            }
        }
        return null;
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

// Indeed handler
class IndeedHandler {
    canHandle(url) {
        return url.includes('indeed.com');
    }

    extractCompanyName(url) {
        // For Indeed, we'll primarily rely on page content since URLs don't contain company info
        return this.findCompanyOnWebPage();
    }

    findCompanyOnWebPage() {
        // TODO: Implement Indeed company extraction based on their page structure
        // This would need to be implemented by analyzing Indeed's job page DOM
        console.log('Indeed page company extraction not yet implemented');
        return null;
    }
}

// CharityJob handler
class CharityJobHandler {
    canHandle(url) {
        return url.includes('charityjob.co.uk');
    }

    extractCompanyName(url) {
        if (url.includes('charityjob.co.uk/organisation/')) {
            return formatCompanyName(url);
        }
        else if (url.includes('charityjob.co.uk/jobs')) {
            const companyInfo = this.findCompanyOnWebPage();
            if (companyInfo) {
                try {
                    let companyUrl = new URL(companyInfo).toString();
                    return formatCompanyName(companyUrl);
                }
                catch (error) {
                    return companyInfo;
                }
            }
        }
        return null;
    }
    
    findCompanyOnWebPage() {
        const jobDetailsDiv = document.querySelector('.job-title-wrapper');
        if (!jobDetailsDiv) {
            return null;
        }
        // First, try to find the company name by the organisation link with class "text-link"
        const companyLinks = jobDetailsDiv.querySelectorAll('a.text-link[href*="/organisation/"]');
        if (companyLinks.length > 0) {
            const companyName = companyLinks[0].textContent?.trim();
            return companyName || null;
        }
        
        // Fallback: Look for div with class "organisation"
        const companyNameDiv = jobDetailsDiv.querySelector('.organisation');
        if (companyNameDiv) {
            const companyName = companyNameDiv.textContent?.trim();
            return companyName || null;
        }
        return null;
    }
}

// Job site factory
const jobSiteFactory = {
    handlers: [
        new LinkedInHandler(),
        new IndeedHandler(),
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