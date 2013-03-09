using System.Collections.Generic;

namespace Interation.iRepeater.Web.ViewModel
{
    public class HomeViewModel
    {
        public List<ProductViewModel> Recommend { get; set; }
        public List<ProductViewModel> Latest { get; set; }
        public List<ProductViewModel> Popular { get; set; }
    }
}
