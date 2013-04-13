using Interation.iRepeater.Web.ViewModel;

namespace Interation.iRepeater.Service.Contract
{
    public static class TopicContractExtension
    {
        public static TopicViewModel ToViewModel(this TopicContract contract)
        {
            return new TopicViewModel
            {
                Id = contract.Id,
                Name = contract.Name,
                ImageUrl = contract.ImageUrl,
                CreatedDate = contract.CreatedDate
            };
        }
    }
}
