using FluentValidation;
using SearchService.DTOs;

namespace SearchService.Validation;

public class AuctionSyncDtoValidator : AbstractValidator<AuctionSyncDto>
{
    public AuctionSyncDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Item).NotNull().WithMessage("Item is required.");
        RuleFor(x => x.Seller).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.AuctionEnd).NotEqual(default(DateTime));
    }
}
