using Microsoft.AspNetCore.Mvc;
using PAR.PortalGenie.Web.Service.Models;

namespace PAR.PortalGenie.Web.Service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssistantController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public AssistantController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    // POST: api/reports/assistant
    [HttpPost("assistant")]
    public async Task<IActionResult> Assistant([FromBody] QueryRequest request)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("AIService");

            var pythonRequest = new
            {
                query = request.Query,
                top_k = request.Limit
            };

            var response = await client.PostAsJsonAsync("/assistant", pythonRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorMessage = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new
                {
                    error = "Failed to fetch data from AI service",
                    details = errorMessage
                });
            }

            var result = await response.Content.ReadFromJsonAsync<AssistantResponse>();

            if (result == null)
                return Ok(new { query = request.Query, message = "No result" });

            // CASE 1: Report search
            if (result.Matches != null && result.Matches.Count > 0)
            {
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
                    query = result.Query,
                    matches = simplifiedMatches,
                    suggestedFilters = result.SuggestedFilters
                });
            }

            // CASE 2: POS read or update
            if (!string.IsNullOrEmpty(result.Action))
            {
                return Ok(new
                {
                    status = result.Status,
                    action = result.Action,
                    message = result.Message,
                    item = result.Item
                });
            }

            // Fallback
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
        }
    }

    // POST: api/reports/feedback
    [HttpPost("feedback")]
    public async Task<IActionResult> SubmitFeedback([FromBody] FeedbackRequest request)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("AIService");

            var response = await client.PostAsJsonAsync("/feedback", request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new { error = "Failed to record feedback", details = error });
            }

            var result = await response.Content.ReadFromJsonAsync<object>();
            return Ok(new { message = "Feedback forwarded", result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Internal Server Error", details = ex.Message });
        }
    }
}