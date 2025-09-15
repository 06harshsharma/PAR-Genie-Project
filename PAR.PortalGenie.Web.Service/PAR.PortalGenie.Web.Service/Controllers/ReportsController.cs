using Microsoft.AspNetCore.Mvc;
using PAR.PortalGenie.Web.Service.Models;

namespace PAR.PortalGenie.Web.Service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ReportsController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    // POST: api/reports/search
    [HttpPost("search")]
    public async Task<IActionResult> SearchReports([FromBody] QueryRequest request)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("AIService");

            // Forward to Python AI service
            var pythonRequest = new
            {
                query = request.Query,
                top_k = request.Limit // Map 'limit' to 'top_k' for Python
            };

            var response = await client.PostAsJsonAsync("/search", pythonRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorMessage = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new
                {
                    error = "Failed to fetch data from AI service",
                    details = errorMessage
                });
            }

            var result = await response.Content.ReadFromJsonAsync<SearchResponse>();

            if (result == null || result.Matches == null)
            {
                return Ok(new { query = request.Query, matches = new List<object>() });
            }

            // Simplify output
            var simplifiedMatches = result.Matches.Select(m => new
            {
                reportId = m.ReportId,
                name = m.Name,
                category = m.Category,
                description = m.Description,
                score = m.Score
            }).ToList();

            return Ok(new
            {
                query = request.Query,
                matches = simplifiedMatches
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
        }
    }
}