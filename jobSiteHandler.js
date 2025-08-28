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

// LinkedIn handler
class LinkedInHandler {
  companyPath = 'company';
  canHandle(url) {
        return url.includes('linkedin.com');
    }

    extractCompanyName(url) {
        if (url.includes('linkedin.com/company/')) {
            return formatCompanyName(url, this.companyPath);
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
  companyPath = 'cmp';
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
  companyPath = 'organisation';
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
    // When we are on the list of jobs, we need to find the active job article
      
    
      const jobDetailsDiv = document.querySelector('.job-details-wrapper.scroll-wrapper') || document.querySelector('.container.job-details-wrapper.single-job-add');
      if (!jobDetailsDiv) {
        console.log('No active job details found');
        return null;
      }

    
      // Find the active job article (has job-id but not display-none class)
      const activeJobArticle = jobDetailsDiv.querySelector('article[job-id]:not(.display-none)');
      if (!activeJobArticle) {
        console.log('No active job article found');
        return null;
      }

      console.log(activeJobArticle);
      
      // Look for job-title-wrapper within the active job article
      const jobTitleDiv = activeJobArticle.querySelector('.job-details-summary .job-summary .job-title-wrapper');
      if (!jobTitleDiv) {
        console.log('No job details found');
          return null;
      }

      console.log(jobTitleDiv);

      
      // First, try to find the company name by the organisation link with class "text-link"
      const companyLinks = jobTitleDiv.querySelectorAll('a.text-link[href*="/organisation/"]');
      if (companyLinks.length > 0) {
          const companyName = companyLinks[0].textContent?.trim();
          return companyName || null;
      }
      
      // Fallback: Look for div with class "organisation"
      const companyNameDiv = jobTitleDiv.querySelector('.organisation');
      if (companyNameDiv) {
          const companyName = companyNameDiv.textContent?.trim();
          return companyName || null;
      }

      console.log('Cant find company');
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