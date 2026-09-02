using EmailService.DTOs;
using EmailService.Entities;

namespace EmailService.Mapping;

public static class LetterMapper
{
    public static LetterDto ToDto(this Letter row) => new()
    {
        Id = row.Id,
        ToUsername = row.ToUsername,
        Kind = row.Kind,
        Subject = row.Subject,
        Body = row.Body,
        CreatedAt = row.CreatedAt,
        ReadAt = row.ReadAt
    };
}
