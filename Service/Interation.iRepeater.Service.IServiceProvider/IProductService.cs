using System.Collections.Generic;
using Interation.iRepeater.Service.Contract;

namespace Interation.iRepeater.Service.IServiceProvider
{
    public interface IProductService
    {
        List<ProductContract> GetNewest();
        List<ProductContract> GetHottest();
    }
}
