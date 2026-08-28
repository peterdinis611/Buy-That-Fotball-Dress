using Contracts;
using FluentValidation;

namespace SearchService.Validation;

public class AuctionDeletedValidator : AbstractValidator<AuctionDeleted>
{
    public AuctionDeletedValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Auction id is required.");
    }
}
